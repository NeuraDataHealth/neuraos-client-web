import { retryMessageResponseSchema } from "@/lib/contracts/messages";
import { retryMessage } from "@/lib/server/chat/messages";
import { route } from "@/lib/server/http/route";

/**
 * POST /api/chats/:chatId/messages/:msgId/retry
 *
 * Retries a failed or stale streaming AI reply.
 * Contract: lib/contracts/messages.ts
 */
export const POST = route("/api/chats/[chatId]/messages/[msgId]/retry", {
  access: "user",
  response: retryMessageResponseSchema,
  handler: async ({ user, params, log }) => {
    return retryMessage(user, params.chatId, params.msgId, log);
  },
});
