import { z } from "zod";

/** Every error code an API route can return (SPEC.md section 6). */
export const errorCodes = [
  // Any route
  "UNAUTHENTICATED",
  "INVALID_REQUEST",
  "NOT_FOUND",
  "FORBIDDEN",
  "FEATURE_OFF",
  "INTERNAL",
  // Chats and messages
  "LIMIT_CHATS",
  "NOT_MEMBER",
  "RATE_LIMIT",
  "DAILY_LIMIT",
  "AT_CAPACITY",
  "AI_BUSY",
  "NOT_RETRYABLE",
  // Files
  "LIMIT_UPLOADS",
  "BAD_FILE",
  "UPLOAD_MISSING",
  // Groups
  "INVITE_INVALID",
  "GROUP_FULL",
  "OWNER_CANNOT_LEAVE",
] as const;

export const errorCodeSchema = z.enum(errorCodes);
export type ErrorCode = z.infer<typeof errorCodeSchema>;

/** Every non-2xx response body: `{ error: { code, message } }`. */
export const errorResponseSchema = z.object({
  error: z.object({
    code: errorCodeSchema,
    message: z.string(),
  }),
});
export type ErrorResponse = z.infer<typeof errorResponseSchema>;

/** HTTP status the server sends with each code. */
export const errorStatus: Record<ErrorCode, number> = {
  UNAUTHENTICATED: 401,
  INVALID_REQUEST: 400,
  NOT_FOUND: 404,
  FORBIDDEN: 403,
  FEATURE_OFF: 403,
  INTERNAL: 500,
  LIMIT_CHATS: 409,
  NOT_MEMBER: 403,
  RATE_LIMIT: 429,
  DAILY_LIMIT: 429,
  AT_CAPACITY: 503,
  AI_BUSY: 409,
  NOT_RETRYABLE: 409,
  LIMIT_UPLOADS: 409,
  BAD_FILE: 400,
  UPLOAD_MISSING: 400,
  INVITE_INVALID: 404,
  GROUP_FULL: 409,
  OWNER_CANNOT_LEAVE: 409,
};
