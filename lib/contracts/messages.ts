import { z } from "zod";
import { MAX_MESSAGE_CHARS, MAX_MEMBERS, MAX_UPLOADS_PER_USER_PER_CHAT } from "@/lib/limits";
import type { Mention } from "@/lib/types";
import { docIdSchema } from "./common";

export const mentionSchema: z.ZodType<Mention> = z.discriminatedUnion("type", [
  z.object({ type: z.literal("ai") }),
  z.object({ type: z.literal("user"), uid: docIdSchema }),
]);

/**
 * POST /api/chats/:id/messages: write a user message and, when it mentions AI
 * (or the chat has one member), run the AI reply. The request stays open until
 * the reply finishes; content arrives through the Firestore listener.
 * Errors: NOT_MEMBER, RATE_LIMIT, DAILY_LIMIT, AT_CAPACITY, AI_BUSY.
 */
export const sendMessageRequestSchema = z.object({
  text: z.string().trim().min(1).max(MAX_MESSAGE_CHARS),
  /** Structured; the server never parses mentions from text. */
  mentions: z.array(mentionSchema).max(MAX_MEMBERS + 1),
  /** The server builds `replyTo` (name and snippet) from this id. */
  replyToMsgId: docIdSchema.nullable(),
  /** Files already in this chat. */
  attachmentIds: z.array(docIdSchema).max(MAX_MEMBERS * MAX_UPLOADS_PER_USER_PER_CHAT),
});
export type SendMessageRequest = z.infer<typeof sendMessageRequestSchema>;

export const sendMessageResponseSchema = z.object({
  messageId: docIdSchema,
  /** The AI message (answer, decline or emergency notice), or null when the AI was not triggered. */
  aiMessageId: docIdSchema.nullable(),
});
export type SendMessageResponse = z.infer<typeof sendMessageResponseSchema>;

/**
 * POST /api/chats/:id/messages/:msgId/retry: re-run a failed AI reply
 * (`error`, or `streaming` older than STALE_STREAM_SECONDS). `msgId` is the AI message.
 * Errors: NOT_MEMBER, NOT_RETRYABLE, plus the send limits.
 */
export const retryMessageResponseSchema = z.object({ aiMessageId: docIdSchema });
export type RetryMessageResponse = z.infer<typeof retryMessageResponseSchema>;

/** POST /api/chats/:id/messages/:msgId/feedback: thumbs up or down on an AI reply. Errors: NOT_MEMBER. */
export const feedbackRequestSchema = z.object({
  rating: z.enum(["up", "down"]),
  reason: z.string().trim().max(500).nullable(),
});
export type FeedbackRequest = z.infer<typeof feedbackRequestSchema>;
