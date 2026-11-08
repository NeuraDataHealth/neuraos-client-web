import { completeUploadResponseSchema } from "@/lib/contracts/files";
import { completeFileUpload } from "@/lib/server/files/service";
import { route } from "@/lib/server/http/route";

/**
 * POST /api/chats/:id/files/:fileId/complete
 *
 * Registers the upload and runs extraction.
 * Contract: lib/contracts/files.ts
 */
export const POST = route("/api/chats/[chatId]/files/[fileId]/complete", {
  access: "user",
  response: completeUploadResponseSchema,
  handler: async ({ user, params }) => {
    return completeFileUpload(params.chatId, params.fileId, user);
  },
});
