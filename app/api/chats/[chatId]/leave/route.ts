import { okResponseSchema } from "@/lib/contracts/common";
import { leaveRequestSchema } from "@/lib/contracts/groups";
import { leaveGroup } from "@/lib/server/groups/service";
import { route } from "@/lib/server/http/route";

/**
 * POST /api/chats/:id/leave
 *
 * Member leaves the group. Cannot be called by the owner.
 * Contract: lib/contracts/groups.ts
 */
export const POST = route("/api/chats/[chatId]/leave", {
  access: "user",
  body: leaveRequestSchema,
  response: okResponseSchema,
  handler: async ({ user, params, body }) => {
    return leaveGroup(params.chatId, user, body);
  },
});
