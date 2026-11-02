import { okResponseSchema } from "@/lib/contracts/common";
import { feedbackRequestSchema } from "@/lib/contracts/messages";
import { submitFeedback } from "@/lib/server/chat/messages";
import { route } from "@/lib/server/http/route";

/**
 * POST /api/chats/:chatId/messages/:msgId/feedback
 *
 * Records thumbs up or down rating on an AI reply.
 * Contract: lib/contracts/messages.ts
 */
export const POST = route("/api/chats/[chatId]/messages/[msgId]/feedback", {
  access: "user",
  body: feedbackRequestSchema,
  response: okResponseSchema,
  handler: async ({ user, params, body }) => {
    return submitFeedback(user, params.chatId, params.msgId, body);
  },
});
