import { z } from "zod";
import { docIdSchema } from "./common";

/** POST /api/chats: create a chat owned by the caller. Errors: LIMIT_CHATS. */
export const createChatRequestSchema = z.object({
  /** Defaults to "New chat" on the server. */
  title: z.string().trim().min(1).max(120).optional(),
});
export type CreateChatRequest = z.infer<typeof createChatRequestSchema>;

export const createChatResponseSchema = z.object({ chatId: docIdSchema });
export type CreateChatResponse = z.infer<typeof createChatResponseSchema>;
