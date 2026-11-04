import { convertRequestSchema, convertResponseSchema } from "@/lib/contracts/groups";
import { convertChat } from "@/lib/server/groups/service";
import { route } from "@/lib/server/http/route";

/**
 * POST /api/chats/:id/convert
 *
 * Turns a chat into a group.
 * Contract: lib/contracts/groups.ts
 */
export const POST = route("/api/chats/[chatId]/convert", {
  access: "user",
  body: convertRequestSchema,
  response: convertResponseSchema,
  handler: async ({ user, params, body }) => {
    return convertChat(params.chatId, user, body);
  },
});
