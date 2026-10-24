import { z } from "zod";
import { MAX_VOICE_BYTES, MAX_VOICE_SECONDS } from "@/lib/limits";
import { docIdSchema, uploadTargetSchema } from "./common";

/** Audio types MediaRecorder produces in current browsers. */
export const ALLOWED_AUDIO_MIME = ["audio/webm", "audio/ogg", "audio/mp4", "audio/mpeg", "audio/wav"] as const;

export const piiFlagSchema = z.object({
  kind: z.enum(["name", "phone", "id_number", "address"]),
  excerpt: z.string(),
});

export const piiCheckSchema = z.object({
  status: z.enum(["clean", "flagged"]),
  flags: z.array(piiFlagSchema),
});
export type PiiCheck = z.infer<typeof piiCheckSchema>;

const titleSchema = z.string().trim().min(3).max(160);
const specialtySchema = z.string().trim().min(2).max(80);
const textSchema = z.string().max(50_000);

/**
 * POST /api/contributions: create a draft (`canContribute`, `contributionsEnabled`).
 * Errors: FORBIDDEN, FEATURE_OFF, DAILY_LIMIT.
 */
export const createContributionRequestSchema = z.object({
  type: z.enum(["text", "voice"]),
  title: titleSchema,
  specialty: specialtySchema,
  /** Empty for a voice draft until the transcript is confirmed. */
  text: textSchema,
});
export type CreateContributionRequest = z.infer<typeof createContributionRequestSchema>;

export const createContributionResponseSchema = z.object({ contributionId: docIdSchema });
export type CreateContributionResponse = z.infer<typeof createContributionResponseSchema>;

/**
 * PATCH /api/contributions/:id: update a draft or a `needs_changes` contribution (owner).
 * For voice, `text` is the transcript the contributor edited. Errors: FORBIDDEN. Returns OkResponse.
 */
export const updateContributionRequestSchema = z
  .object({ title: titleSchema, specialty: specialtySchema, text: textSchema })
  .partial()
  .refine((body) => Object.keys(body).length > 0, "Nothing to update");
export type UpdateContributionRequest = z.infer<typeof updateContributionRequestSchema>;

/** POST /api/contributions/:id/audio-url: signed PUT URL under `contributions/{uid}/` (owner). Errors: FORBIDDEN, BAD_FILE. */
export const audioUploadUrlRequestSchema = z.object({
  mimeType: z.enum(ALLOWED_AUDIO_MIME),
  sizeBytes: z.number().int().positive().max(MAX_VOICE_BYTES),
  durationSec: z.number().positive().max(MAX_VOICE_SECONDS),
});
export type AudioUploadUrlRequest = z.infer<typeof audioUploadUrlRequestSchema>;

export const audioUploadUrlResponseSchema = uploadTargetSchema;
export type AudioUploadUrlResponse = z.infer<typeof audioUploadUrlResponseSchema>;

/** POST /api/contributions/:id/transcribe: fills `transcript.draftText` (owner). Errors: FORBIDDEN, UPLOAD_MISSING. */
export const transcribeResponseSchema = z.object({
  status: z.enum(["ready", "failed"]),
  draftText: z.string().nullable(),
});
export type TranscribeResponse = z.infer<typeof transcribeResponseSchema>;

/**
 * POST /api/contributions/:id/submit: runs the PII check, then submits (owner).
 * If flags are found and `confirmFlagged` is false, nothing is submitted and the
 * flags come back so the contributor can fix the text or confirm.
 * Errors: FORBIDDEN, DAILY_LIMIT.
 */
export const submitContributionRequestSchema = z.object({
  contributionTermsVersion: z.string().min(1).max(20),
  confirmFlagged: z.boolean(),
});
export type SubmitContributionRequest = z.infer<typeof submitContributionRequestSchema>;

export const submitContributionResponseSchema = z.object({
  submitted: z.boolean(),
  piiCheck: piiCheckSchema,
});
export type SubmitContributionResponse = z.infer<typeof submitContributionResponseSchema>;
