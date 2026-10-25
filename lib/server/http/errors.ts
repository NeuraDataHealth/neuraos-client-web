import "server-only";
import { errorStatus, type ErrorCode } from "@/lib/contracts/errors";

/** Default user-facing message per code; pass a better one when you have it. */
const defaultMessages: Record<ErrorCode, string> = {
  UNAUTHENTICATED: "Sign in to continue.",
  INVALID_REQUEST: "Something in the request is not valid.",
  NOT_FOUND: "Not found.",
  FORBIDDEN: "You don't have permission to do that.",
  FEATURE_OFF: "This feature is switched off right now.",
  INTERNAL: "Something went wrong. Please try again.",
  LIMIT_CHATS: "You have reached the chat limit. Delete a chat to start a new one.",
  NOT_MEMBER: "You are not a member of this chat.",
  RATE_LIMIT: "You're sending messages too fast. Wait a minute and try again.",
  DAILY_LIMIT: "You have reached today's limit. Try again tomorrow.",
  AT_CAPACITY: "NeuraOS is at capacity today. Please try again tomorrow.",
  AI_BUSY: "Your previous question is still being answered.",
  NOT_RETRYABLE: "This reply can't be retried.",
  LIMIT_UPLOADS: "You have reached the upload limit for this chat.",
  BAD_FILE: "Upload a PDF, JPEG or PNG up to 10 MB.",
  UPLOAD_MISSING: "The upload didn't finish. Please try again.",
  INVITE_INVALID: "This invite link is invalid or has been revoked.",
  GROUP_FULL: "This group is full.",
  OWNER_CANNOT_LEAVE: "The owner can't leave the group.",
};

/**
 * Throw from a route handler to send `{ error: { code, message } }` with the
 * code's HTTP status. The message is shown to users: never put patient data,
 * message text or file contents in it.
 */
export class ApiError extends Error {
  readonly status: number;

  constructor(
    readonly code: ErrorCode,
    message: string = defaultMessages[code],
  ) {
    super(message);
    this.name = "ApiError";
    this.status = errorStatus[code];
  }
}
