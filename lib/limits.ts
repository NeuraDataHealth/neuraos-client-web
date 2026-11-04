/**
 * Limits (SPEC.md section 11). Every limit is enforced on the server;
 * the UI may read these only to show hints and disable controls early.
 */

const MB = 1024 * 1024;

/** Join transaction. Includes the owner. */
export const MAX_MEMBERS = 4;
/** `upload-url`; counts uploads ever made, not current files. */
export const MAX_UPLOADS_PER_USER_PER_CHAT = 3;
/** `upload-url`; uploads ever made in one chat, all members together. */
export const MAX_FILES_PER_CHAT = 10;
/** `upload-url`; one user, all chats, per IST day. */
export const UPLOADS_PER_DAY = 5;
/** `upload-url` (declared size) and `complete` (real size); one user, all chats, per IST day. */
export const UPLOAD_BYTES_PER_DAY = 25 * MB;
/** `upload-url` and `complete`. */
export const MAX_FILE_BYTES = 10 * MB;
/** `complete`; longer PDFs are rejected (extraction cost grows with pages). */
export const MAX_PDF_PAGES = 30;
/** Firestore TTL on `files.expiresAt` and the Storage lifecycle rule on `chats/`. */
export const FILE_RETENTION_DAYS = 30;
/** `upload-url` and `complete`. */
export const ALLOWED_MIME = ["application/pdf", "image/jpeg", "image/png"] as const;
export type AllowedMime = (typeof ALLOWED_MIME)[number];

/** Messages route. */
export const MESSAGES_PER_MINUTE = 10;
/** Messages route. Finished answers per user per IST day. */
export const AI_REPLIES_PER_DAY = 30;
/** Messages route. AI cost one user may cause per IST day (answers, files, PII checks). */
export const USER_DAILY_SPEND_CAP_USD = 0.6;
/** Messages route. AI replies started in one group per IST day, all members together. */
export const GROUP_AI_REPLIES_PER_DAY = 80;
/** Retry route. */
export const MAX_RETRIES_PER_MESSAGE = 3;
/** Answer model `maxOutputTokens` (thinking included); the prompt asks for under ~700 words. */
export const MAX_ANSWER_OUTPUT_TOKENS = 2_500;

/** `POST /api/chats`. Solo chats a user owns; the next one replaces the oldest after a confirm. */
export const MAX_SOLO_CHATS = 30;
/** `convert`. Groups a user created; the next one replaces the oldest after a confirm. */
export const MAX_OWNED_GROUPS = 10;
/** Join. Groups a user belongs to without owning them. */
export const MAX_JOINED_GROUPS = 15;
/** `convert`, per user per IST day. */
export const GROUPS_CREATED_PER_DAY = 3;
/** Join, per user per IST day. */
export const GROUP_JOINS_PER_DAY = 5;
/** Invite links stop working this long after they are created or rotated. */
export const INVITE_TTL_DAYS = 7;
/** Messages route. */
export const MAX_MESSAGE_CHARS = 4_000;

/** Context builder. */
export const HISTORY_MESSAGES_IN_CONTEXT = 30;
/** Context builder. */
export const CONTEXT_FILE_TOKEN_BUDGET = 40_000;

/** `aiInFlight` slot lifetime. */
export const AI_SLOT_TTL_SECONDS = 60;
/** Client shows Retry for a `streaming` message older than this. */
export const STALE_STREAM_SECONDS = 45;
/** AI streaming flush interval (about 1 write per second per doc). */
export const STREAM_FLUSH_MS = 1_000;

/** Contributions routes. */
export const CONTRIBUTIONS_PER_DAY = 20;
/** `audio-url` and `transcribe`. */
export const MAX_VOICE_SECONDS = 600;
/** `audio-url`. */
export const MAX_VOICE_BYTES = 25 * MB;
/** Verification `upload-url`. */
export const MAX_VERIFICATION_DOC_BYTES = 10 * MB;

/** Onboarding: how long a referral code waits in the cookie. */
export const REFERRAL_COOKIE_DAYS = 30;
/** Seed value for `config/app.dailySpendCapUsd`. */
export const DEFAULT_DAILY_SPEND_CAP_USD = 15;
