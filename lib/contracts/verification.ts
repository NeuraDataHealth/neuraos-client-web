import { z } from "zod";
import { MAX_VERIFICATION_DOC_BYTES } from "@/lib/limits";
import { docIdSchema, fileNameSchema, uploadTargetSchema } from "./common";

export const verificationDocumentKindSchema = z.enum(["registration_certificate", "id_proof"]);

/** POST /api/verification/upload-url: signed PUT URL under `verification/{uid}/`. Errors: BAD_FILE. */
export const verificationUploadUrlRequestSchema = z.object({
  kind: verificationDocumentKindSchema,
  fileName: fileNameSchema,
  mimeType: z.enum(["application/pdf", "image/jpeg", "image/png"]),
  sizeBytes: z.number().int().positive().max(MAX_VERIFICATION_DOC_BYTES),
});
export type VerificationUploadUrlRequest = z.infer<typeof verificationUploadUrlRequestSchema>;

export const verificationUploadUrlResponseSchema = uploadTargetSchema.extend({
  /** Pass back in `documents` when submitting. */
  gcsUri: z.string().startsWith("gs://"),
});
export type VerificationUploadUrlResponse = z.infer<typeof verificationUploadUrlResponseSchema>;

/**
 * POST /api/verification: submit, or resubmit after `needs_info`.
 * Sets the application and `users.verification.status` to `pending`.
 * Errors: FORBIDDEN (already pending or approved), BAD_FILE (document not under the caller's folder).
 */
export const submitVerificationRequestSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  phone: z.string().trim().regex(/^\+?[0-9 -]{8,16}$/),
  specialty: z.string().trim().min(2).max(80),
  institution: z.string().trim().min(2).max(160),
  registrationNumber: z.string().trim().min(3).max(40),
  councilName: z.string().trim().min(2).max(120),
  registrationYear: z.number().int().min(1950).max(new Date().getFullYear()),
  documents: z
    .array(
      z.object({
        fileName: fileNameSchema,
        gcsUri: z.string().startsWith("gs://"),
        kind: verificationDocumentKindSchema,
      }),
    )
    .min(2)
    .max(4)
    .refine(
      (docs) => docs.some((d) => d.kind === "registration_certificate") && docs.some((d) => d.kind === "id_proof"),
      "Upload a registration certificate and an ID proof",
    ),
});
export type SubmitVerificationRequest = z.infer<typeof submitVerificationRequestSchema>;

export const submitVerificationResponseSchema = z.object({
  applicationId: docIdSchema,
  status: z.literal("pending"),
});
export type SubmitVerificationResponse = z.infer<typeof submitVerificationResponseSchema>;
