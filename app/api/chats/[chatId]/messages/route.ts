import {
  sendMessageRequestSchema,
  sendMessageResponseSchema,
} from "@/lib/contracts/messages";
import { sendMessage } from "@/lib/server/chat/messages";
import { route } from "@/lib/server/http/route";

/**
 * POST /api/chats/:chatId/messages
 *
 * Writes a user message; triggers and streams the AI reply when mentioned or in a solo chat.
 * Contract: lib/contracts/messages.ts
 */
export const POST = route("/api/chats/[chatId]/messages", {
  access: "user",
  body: sendMessageRequestSchema,
  response: sendMessageResponseSchema,
  handler: async ({ user, params, body, log }) => {
    return sendMessage(user, params.chatId, body, log);
  },
});
