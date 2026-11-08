import { adminUserUsageResponseSchema } from "@/lib/contracts/admin";
import { getAdminUserUsage } from "@/lib/server/admin/service";
import { route } from "@/lib/server/http/route";

/**
 * GET /api/admin/users/:id/usage
 *
 * One user's usage counters for today (India time).
 * Contract: lib/contracts/admin.ts
 */
export const GET = route("/api/admin/users/[id]/usage", {
  access: "admin",
  response: adminUserUsageResponseSchema,
  handler: async ({ params }) => {
    return getAdminUserUsage(params.id);
  },
});
