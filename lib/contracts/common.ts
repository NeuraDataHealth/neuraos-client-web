import { z } from "zod";

/** Firestore document id in a URL or body. */
export const docIdSchema = z.string().min(1).max(128);

/** Timestamps cross the API as ISO 8601 strings. */
export const isoDateSchema = z.iso.datetime();

/** `{ ok: true }` for routes that return nothing else. */
export const okResponseSchema = z.object({ ok: z.literal(true) });
export type OkResponse = z.infer<typeof okResponseSchema>;

export const fileNameSchema = z.string().trim().min(1).max(200);

/**
 * Where the client PUTs the file: a short-lived signed URL.
 * Send exactly `headers` with the PUT, or the signature fails.
 */
export const uploadTargetSchema = z.object({
  uploadUrl: z.url(),
  headers: z.record(z.string(), z.string()),
  expiresAt: isoDateSchema,
});
export type UploadTarget = z.infer<typeof uploadTargetSchema>;

/** Cursor pagination for admin lists. */
export const pageQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});
export type PageQuery = z.infer<typeof pageQuerySchema>;

export function pageOf<T extends z.ZodType>(item: T) {
  return z.object({
    items: z.array(item),
    nextCursor: z.string().nullable(),
  });
}
