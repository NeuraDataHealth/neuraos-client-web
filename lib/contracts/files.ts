import { z } from "zod";
import { ALLOWED_MIME, MAX_FILE_BYTES } from "@/lib/limits";
import { docIdSchema, fileNameSchema, isoDateSchema, uploadTargetSchema } from "./common";

/**
 * POST /api/chats/:id/files/upload-url: checks upload count, size and type,
 * then returns a signed PUT URL for `chats/{chatId}/{fileId}`.
 * Errors: NOT_MEMBER, LIMIT_UPLOADS, BAD_FILE.
 */
export const fileUploadUrlRequestSchema = z.object({
  fileName: fileNameSchema,
  mimeType: z.enum(ALLOWED_MIME),
  sizeBytes: z.number().int().positive().max(MAX_FILE_BYTES),
});
export type FileUploadUrlRequest = z.infer<typeof fileUploadUrlRequestSchema>;

export const fileUploadUrlResponseSchema = uploadTargetSchema.extend({ fileId: docIdSchema });
export type FileUploadUrlResponse = z.infer<typeof fileUploadUrlResponseSchema>;

/**
 * POST /api/chats/:id/files/:fileId/complete: registers the upload and runs extraction.
 * Returns once the file is `ready` or `failed`. Errors: UPLOAD_MISSING, BAD_FILE.
 */
export const completeUploadResponseSchema = z.object({
  fileId: docIdSchema,
  status: z.enum(["ready", "failed"]),
});
export type CompleteUploadResponse = z.infer<typeof completeUploadResponseSchema>;

/** DELETE /api/chats/:id/files/:fileId: uploader or owner. Errors: FORBIDDEN. Returns OkResponse. */

/**
 * GET /api/files/:fileId/url?chatId=: short-lived signed download URL.
 * Member of the file's chat, or admin. Errors: NOT_MEMBER, NOT_FOUND.
 */
export const fileUrlQuerySchema = z.object({ chatId: docIdSchema });
export type FileUrlQuery = z.infer<typeof fileUrlQuerySchema>;

export const fileUrlResponseSchema = z.object({
  url: z.url(),
  expiresAt: isoDateSchema,
});
export type FileUrlResponse = z.infer<typeof fileUrlResponseSchema>;
