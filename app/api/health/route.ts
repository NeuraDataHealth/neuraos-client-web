import { z } from "zod";
import { route } from "@/lib/server/http/route";

const healthResponseSchema = z.object({ ok: z.literal(true), time: z.iso.datetime() });

/** GET /api/health: liveness check, no auth. Example of the route() wrapper. */
export const GET = route("/api/health", {
  access: "public",
  response: healthResponseSchema,
  handler: async () => ({ ok: true as const, time: new Date().toISOString() }),
});
