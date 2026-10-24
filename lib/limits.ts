/**
 * Limits (SPEC.md section 11). Every limit is enforced on the server;
 * the UI may read these only to show hints and disable controls early.
 */

const MB = 1024 * 1024;

/** Join transaction. */
export const MAX_MEMBERS = 3;
/** `upload-url`; counts uploads ever made, not current files. */
export const MAX_UPLOADS_PER_USER_PER_CHAT = 2;
/** `upload-url` and `complete`. */
export const MAX_FILE_BYTES = 10 * MB;
/** `upload-url` and `complete`. */
export const ALLOWED_MIME = ["application/pdf", "image/jpeg", "image/png"] as const;
export type AllowedMime = (typeof ALLOWED_MIME)[number];

/** Messages route. */
export const MESSAGES_PER_MINUTE = 10;
/** Messages route. */
export const AI_REPLIES_PER_DAY = 20;
/** `POST /api/chats`. */
export const MAX_CHATS_PER_USER = 20;
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
