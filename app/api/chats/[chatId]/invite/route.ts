import { okResponseSchema } from "@/lib/contracts/common";
import { inviteResponseSchema } from "@/lib/contracts/groups";
import { createOrRotateInvite, revokeInvite } from "@/lib/server/groups/service";
import { route } from "@/lib/server/http/route";

/**
 * POST /api/chats/:id/invite
 *
 * Creates or rotates the group's invite token.
 * Contract: lib/contracts/groups.ts
 */
export const POST = route("/api/chats/[chatId]/invite", {
  access: "user",
  response: inviteResponseSchema,
  handler: async ({ user, params }) => {
    return createOrRotateInvite(params.chatId, user);
  },
});

/**
 * DELETE /api/chats/:id/invite
 *
 * Revokes the invite link.
 * Contract: lib/contracts/groups.ts
 */
export const DELETE = route("/api/chats/[chatId]/invite", {
  access: "user",
  response: okResponseSchema,
  handler: async ({ user, params }) => {
    return revokeInvite(params.chatId, user);
  },
});
