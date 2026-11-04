import { fileUrlQuerySchema, fileUrlResponseSchema } from "@/lib/contracts/files";
import { getChatFileDownloadUrl } from "@/lib/server/files/service";
import { route } from "@/lib/server/http/route";

/**
 * GET /api/files/:fileId/url?chatId=
 *
 * Short-lived signed download URL. Caller must be a member of the file's chat, or admin.
 * Contract: lib/contracts/files.ts
 */
export const GET = route("/api/files/[fileId]/url", {
  access: "user",
  query: fileUrlQuerySchema,
  response: fileUrlResponseSchema,
  handler: async ({ user, params, query }) => {
    return getChatFileDownloadUrl(params.fileId, query.chatId, user);
  },
});
