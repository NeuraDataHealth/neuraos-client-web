import { z } from "zod";
import { docIdSchema } from "./common";

/**
 * POST /api/chats/:id/convert: turn a chat into a group (owner, `groupsEnabled`).
 * shareHistory true: the same chat becomes the group; unchecked files are deleted.
 * shareHistory false: a new chat (`forkedFrom`) gets copies of the checked files only.
 * Errors: FORBIDDEN, FEATURE_OFF.
 */
export const convertRequestSchema = z.object({
  shareHistory: z.boolean(),
  fileIds: z.array(docIdSchema),
});
export type ConvertRequest = z.infer<typeof convertRequestSchema>;

/** The group's chat id: the same chat, or the new fork. */
export const convertResponseSchema = z.object({ chatId: docIdSchema });
export type ConvertResponse = z.infer<typeof convertResponseSchema>;

/** POST /api/chats/:id/invite: create or rotate the invite token (owner). The link is `/join/{token}`. Errors: FORBIDDEN. */
export const inviteResponseSchema = z.object({ token: z.string().min(32) });
export type InviteResponse = z.infer<typeof inviteResponseSchema>;

/** DELETE /api/chats/:id/invite: revoke the link (owner). Errors: FORBIDDEN. Returns OkResponse. */

/** POST /api/join/:token: join a group. Already a member: returns the chat id too. Errors: INVITE_INVALID, GROUP_FULL. */
export const joinResponseSchema = z.object({ chatId: docIdSchema });
export type JoinResponse = z.infer<typeof joinResponseSchema>;

/** POST /api/chats/:id/leave: member, not owner. Errors: NOT_MEMBER, OWNER_CANNOT_LEAVE. Returns OkResponse. */
export const leaveRequestSchema = z.object({ deleteMyFiles: z.boolean() });
export type LeaveRequest = z.infer<typeof leaveRequestSchema>;

/** DELETE /api/chats/:id/members/:uid: owner removes a member. Errors: FORBIDDEN. Returns OkResponse. */
