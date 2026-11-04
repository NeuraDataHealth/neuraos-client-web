import { joinPreviewResponseSchema, joinResponseSchema } from "@/lib/contracts/groups";
import { getJoinPreview, joinGroup } from "@/lib/server/groups/service";
import { route } from "@/lib/server/http/route";

/**
 * GET /api/join/:token
 *
 * Preview group details before joining.
 * Contract: lib/contracts/groups.ts
 */
export const GET = route("/api/join/[token]", {
  access: "user",
  response: joinPreviewResponseSchema,
  handler: async ({ user, params }) => {
    return getJoinPreview(params.token, user);
  },
});

/**
 * POST /api/join/:token
 *
 * Joins a group with the invite token.
 * Contract: lib/contracts/groups.ts
 */
export const POST = route("/api/join/[token]", {
  access: "user",
  response: joinResponseSchema,
  handler: async ({ user, params }) => {
    return joinGroup(params.token, user);
  },
});
