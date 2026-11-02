import { createChatRequestSchema, createChatResponseSchema } from "@/lib/contracts/chats";
import { createChat } from "@/lib/server/chat/chats";
import { route } from "@/lib/server/http/route";

/**
 * POST /api/chats
 *
 * Creates a new chat owned by the caller.
 * Contract: lib/contracts/chats.ts
 */
export const POST = route("/api/chats", {
  access: "user",
  body: createChatRequestSchema,
  response: createChatResponseSchema,
  handler: async ({ user, body }) => {
    return createChat(user, body);
  },
});
