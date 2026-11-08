import { z } from "zod";
import { docIdSchema } from "./common";

/**
 * POST /api/chats/:id/convert: turn a chat into a group (owner, `groupsEnabled`).
 * shareHistory true: the same chat becomes the group; unchecked files are deleted.
 * shareHistory false: a new chat (`forkedFrom`) gets copies of the checked files only.
 * Errors: FORBIDDEN, FEATURE_OFF, INVALID_REQUEST (already a group), LIMIT_GROUPS.
 */
export const convertRequestSchema = z.object({
  shareHistory: z.boolean(),
  fileIds: z.array(docIdSchema),
  /** At MAX_OWNED_GROUPS: delete the least recently active owned group first (after the user confirms). */
  replaceOldestGroup: z.boolean().optional(),
});
export type ConvertRequest = z.infer<typeof convertRequestSchema>;

/** The group's chat id: the same chat, or the new fork. */
export const convertResponseSchema = z.object({ chatId: docIdSchema });
export type ConvertResponse = z.infer<typeof convertResponseSchema>;

/** POST /api/chats/:id/invite: create or rotate the invite token (owner). The link is `/join/{token}`. Errors: FORBIDDEN. */
export const inviteResponseSchema = z.object({ token: z.string().min(32) });
export type InviteResponse = z.infer<typeof inviteResponseSchema>;

/** DELETE /api/chats/:id/invite: revoke the link (owner). Errors: FORBIDDEN. Returns OkResponse. */

/**
 * POST /api/join/:token: join a group. Already a member: returns the chat id too.
 * Errors: INVITE_INVALID (revoked or older than INVITE_TTL_DAYS), GROUP_FULL, LIMIT_GROUPS.
 */
export const joinResponseSchema = z.object({ chatId: docIdSchema });
export type JoinResponse = z.infer<typeof joinResponseSchema>;

/** GET /api/join/:token: preview group before joining. Errors: INVITE_INVALID. */
export const joinPreviewResponseSchema = z.object({
  chatId: docIdSchema.nullable(),
  title: z.string(),
  inviterName: z.string(),
  inviterLine: z.string().nullable(),
  memberNames: z.array(z.string()),
  memberCount: z.number().int(),
  maxMembers: z.number().int(),
  isMember: z.boolean(),
  isFull: z.boolean(),
  isActive: z.boolean(),
});
export type JoinPreviewResponse = z.infer<typeof joinPreviewResponseSchema>;


/** POST /api/chats/:id/leave: member, not owner. Errors: NOT_MEMBER, OWNER_CANNOT_LEAVE. Returns OkResponse. */
export const leaveRequestSchema = z.object({ deleteMyFiles: z.boolean() });
export type LeaveRequest = z.infer<typeof leaveRequestSchema>;

/** DELETE /api/chats/:id/members/:uid: owner removes a member. Errors: FORBIDDEN. Returns OkResponse. */
