import { okResponseSchema } from "@/lib/contracts/common";
import { removeGroupMember } from "@/lib/server/groups/service";
import { route } from "@/lib/server/http/route";

/**
 * DELETE /api/chats/:id/members/:uid
 *
 * Owner removes a member from the group.
 * Contract: lib/contracts/groups.ts
 */
export const DELETE = route("/api/chats/[chatId]/members/[uid]", {
  access: "user",
  response: okResponseSchema,
  handler: async ({ user, params }) => {
    return removeGroupMember(params.chatId, params.uid, user);
  },
});
