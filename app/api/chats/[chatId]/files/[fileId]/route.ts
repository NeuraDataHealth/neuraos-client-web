import { okResponseSchema } from "@/lib/contracts/common";
import { deleteChatFile } from "@/lib/server/files/service";
import { route } from "@/lib/server/http/route";

/**
 * DELETE /api/chats/:id/files/:fileId
 *
 * Deletes a file. Caller must be the uploader or the chat owner.
 * Contract: lib/contracts/files.ts
 */
export const DELETE = route("/api/chats/[chatId]/files/[fileId]", {
  access: "user",
  response: okResponseSchema,
  handler: async ({ user, params }) => {
    return deleteChatFile(params.chatId, params.fileId, user);
  },
});
