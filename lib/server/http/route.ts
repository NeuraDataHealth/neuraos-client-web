import "server-only";
import type { NextRequest } from "next/server";
import type { AppRouteHandlerRoutes } from "@/.next/types/routes";
import type { z } from "zod";
import type { ErrorResponse } from "@/lib/contracts/errors";
import { adminAppCheck, adminAuth } from "@/lib/firebase/admin";
import type { GuardrailLabel } from "@/lib/types";
import { ApiError } from "./errors";

/** `public`: no token needed. `user`: valid Firebase ID token. `admin`: token with the `admin` claim. */
type Access = "public" | "user" | "admin";

export type AuthUser = {
  uid: string;
  name: string | null;
  email: string | null;
  picture: string | null;
  admin: boolean;
};

/**
 * Extra fields a handler may add to its request log line (SPEC.md section 12).
 * Deliberately no free-form field: message text, transcripts, file contents and
 * contribution text must never be logged.
 */
export type LogFields = {
  chatId?: string;
  model?: string;
  inputTokens?: number;
  outputTokens?: number;
  costUsd?: number;
  guardrailLabel?: GuardrailLabel;
};

type Schema = z.ZodType | undefined;
type Parsed<S extends Schema> = S extends z.ZodType ? z.infer<S> : undefined;

export type HandlerContext<R extends AppRouteHandlerRoutes, A extends Access, B extends Schema, Q extends Schema> = {
  req: NextRequest;
  requestId: string;
  /** The verified caller; null only on `public` routes. */
  user: A extends "public" ? null : AuthUser;
  params: Awaited<RouteContext<R>["params"]>;
  body: Parsed<B>;
  query: Parsed<Q>;
  /** Mutate to add fields to this request's log line. */
  log: LogFields;
};

type RouteOptions<
  R extends AppRouteHandlerRoutes,
  A extends Access,
  B extends Schema,
  Q extends Schema,
  Res extends z.ZodType,
> = {
  access: A;
  /** Request body schema from lib/contracts. Omit for routes without a body. */
  body?: B;
  /** Query string schema from lib/contracts (GET lists). */
  query?: Q;
  /** Response schema from lib/contracts; the result is checked against it before sending. */
  response: Res;
  handler: (ctx: HandlerContext<R, A, B, Q>) => Promise<z.infer<Res>>;
};

/**
 * Wraps a route handler: verifies the ID token (and App Check, monitor-only),
 * enforces the admin claim, parses body and query with zod, turns ApiError into
 * `{ error: { code, message } }`, checks the response against its contract and
 * logs one JSON line per request.
 *
 * @example
 * export const POST = route("/api/chats", {
 *   access: "user",
 *   body: createChatRequestSchema,
 *   response: createChatResponseSchema,
 *   handler: async ({ user, body }) => ({ chatId: await createChat(user, body) }),
 * });
 */
export function route<
  R extends AppRouteHandlerRoutes,
  A extends Access,
  B extends Schema = undefined,
  Q extends Schema = undefined,
  Res extends z.ZodType = z.ZodType,
>(path: R, options: RouteOptions<R, A, B, Q, Res>) {
  return async (req: NextRequest, ctx: RouteContext<R>): Promise<Response> => {
    const started = Date.now();
    const requestId = req.headers.get("x-cloud-trace-context")?.split("/")[0] || crypto.randomUUID();
    const log: LogFields = {};
    let uid: string | null = null;
    let appCheck: "valid" | "invalid" | "missing" = "missing";
    let errorCode: ErrorResponse["error"]["code"] | undefined;
    let status = 200;
    let response: Response;

    try {
      const [user, appCheckResult] = await Promise.all([
        options.access === "public" ? null : verifyUser(req, options.access === "admin"),
        verifyAppCheck(req),
      ]);
      uid = user?.uid ?? null;
      appCheck = appCheckResult;

      const body = options.body ? parseWith(options.body, await readJson(req)) : undefined;
      const query = options.query
        ? parseWith(options.query, Object.fromEntries(req.nextUrl.searchParams))
        : undefined;

      const result = await options.handler({
        req,
        requestId,
        user: user as HandlerContext<R, A, B, Q>["user"],
        params: (await ctx.params) as HandlerContext<R, A, B, Q>["params"],
        body: body as Parsed<B>,
        query: query as Parsed<Q>,
        log,
      });

      const checked = options.response.safeParse(result);
      if (!checked.success) throw new Error(`Response does not match the contract for ${path}`);
      response = Response.json(checked.data, { status });
    } catch (error) {
      const apiError = error instanceof ApiError ? error : new ApiError("INTERNAL");
      status = apiError.status;
      errorCode = apiError.code;
      if (!(error instanceof ApiError)) logUnexpected(requestId, path, error);
      const payload: ErrorResponse = { error: { code: apiError.code, message: apiError.message } };
      response = Response.json(payload, { status });
    }

    response.headers.set("x-request-id", requestId);
    writeLog({
      severity: status >= 500 ? "ERROR" : status >= 400 ? "WARNING" : "INFO",
      requestId,
      route: path,
      method: req.method,
      uid,
      status,
      latencyMs: Date.now() - started,
      appCheck,
      ...(errorCode ? { errorCode } : {}),
      ...log,
    });
    return response;
  };
}

async function verifyUser(req: NextRequest, requireAdmin: boolean): Promise<AuthUser> {
  const header = req.headers.get("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) throw new ApiError("UNAUTHENTICATED");

  let decoded;
  try {
    decoded = await adminAuth().verifyIdToken(token);
  } catch {
    throw new ApiError("UNAUTHENTICATED");
  }

  const user: AuthUser = {
    uid: decoded.uid,
    name: typeof decoded.name === "string" ? decoded.name : null,
    email: decoded.email ?? null,
    picture: decoded.picture ?? null,
    admin: decoded.admin === true,
  };
  if (requireAdmin && !user.admin) throw new ApiError("FORBIDDEN");
  return user;
}

/** Monitor-only until launch: the result is logged, never enforced. */
async function verifyAppCheck(req: NextRequest): Promise<"valid" | "invalid" | "missing"> {
  const token = req.headers.get("x-firebase-appcheck");
  if (!token) return "missing";
  try {
    await adminAppCheck().verifyToken(token);
    return "valid";
  } catch {
    return "invalid";
  }
}

async function readJson(req: NextRequest): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    throw new ApiError("INVALID_REQUEST", "The request body must be JSON.");
  }
}

function parseWith<S extends z.ZodType>(schema: S, value: unknown): z.infer<S> {
  const result = schema.safeParse(value);
  if (!result.success) {
    throw new ApiError("INVALID_REQUEST", result.error.issues[0]?.message ?? "Invalid request");
  }
  return result.data;
}

/** Error name and message only; thrown errors must never carry user content. */
function logUnexpected(requestId: string, route: string, error: unknown) {
  writeLog({
    severity: "ERROR",
    requestId,
    route,
    errorName: error instanceof Error ? error.name : typeof error,
    errorMessage: error instanceof Error ? error.message : undefined,
  });
}

/** One JSON line to stdout; Cloud Logging reads `severity` from it. */
function writeLog(line: Record<string, unknown>) {
  console.log(JSON.stringify(line));
}
