import { setUserCanContributeRequestSchema } from "@/lib/contracts/admin";
import { okResponseSchema } from "@/lib/contracts/common";
import { setUserCanContribute } from "@/lib/server/admin/service";
import { route } from "@/lib/server/http/route";

/**
 * PATCH /api/admin/users/:id/can-contribute
 *
 * Sets a user's canContribute flag.
 * Contract: lib/contracts/admin.ts
 */
export const PATCH = route("/api/admin/users/[id]/can-contribute", {
  access: "admin",
  body: setUserCanContributeRequestSchema,
  response: okResponseSchema,
  handler: async ({ user, params, body }) => {
    return setUserCanContribute(params.id, body.canContribute, user);
  },
});
