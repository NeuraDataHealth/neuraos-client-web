import {
  fileUploadUrlRequestSchema,
  fileUploadUrlResponseSchema,
} from "@/lib/contracts/files";
import { createFileUploadUrl } from "@/lib/server/files/service";
import { route } from "@/lib/server/http/route";

/**
 * POST /api/chats/:id/files/upload-url
 *
 * Checks upload count, size and type, then returns a signed PUT URL for
 * `chats/{chatId}/{fileId}`.
 * Contract: lib/contracts/files.ts
 */
export const POST = route("/api/chats/[chatId]/files/upload-url", {
  access: "user",
  body: fileUploadUrlRequestSchema,
  response: fileUploadUrlResponseSchema,
  handler: async ({ user, params, body }) => {
    return createFileUploadUrl(params.chatId, user, body);
  },
});
