import { okResponseSchema } from "@/lib/contracts/common";
import { deleteOwnChat } from "@/lib/server/chat/chats";
import { route } from "@/lib/server/http/route";

/**
 * DELETE /api/chats/:chatId
 *
 * The owner deletes the chat for every member (messages, files, stored objects).
 * Contract: lib/contracts/chats.ts
 */
export const DELETE = route("/api/chats/[chatId]", {
  access: "user",
  response: okResponseSchema,
  handler: async ({ user, params }) => {
    return deleteOwnChat(user, params.chatId);
  },
});
