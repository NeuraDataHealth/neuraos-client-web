import { adminSpendResponseSchema } from "@/lib/contracts/admin";
import { getAdminSpend } from "@/lib/server/admin/service";
import { route } from "@/lib/server/http/route";

/**
 * GET /api/admin/spend
 *
 * Sums today's spend shards.
 * Contract: lib/contracts/admin.ts
 */
export const GET = route("/api/admin/spend", {
  access: "admin",
  response: adminSpendResponseSchema,
  handler: async () => {
    return getAdminSpend();
  },
});
