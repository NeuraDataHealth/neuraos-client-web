import { z } from "zod";
import { DEPARTMENTS, PROFESSION_VALUES } from "@/lib/profession";

/** Cookie that holds `?ref=CODE` for REFERRAL_COOKIE_DAYS. */
export const REFERRAL_COOKIE_NAME = "neuraos_ref";

export const referralCodeSchema = z.string().regex(/^[A-Z0-9]{8}$/);

/**
 * POST /api/onboarding: after every sign-in. Creates the user doc and referral code
 * on first sign-in and counts the referral; existing users never count. Safe to repeat.
 */
export const onboardingRequestSchema = z.object({
  /** From the referral cookie, if any. Invalid or own codes are ignored. */
  referralCode: referralCodeSchema.nullable(),
  /** Terms version the user accepted on the sign-in screen. */
  termsVersion: z.string().min(1).max(20),
});
export type OnboardingRequest = z.infer<typeof onboardingRequestSchema>;

export const onboardingResponseSchema = z.object({
  /** True on first sign-in. */
  isNew: z.boolean(),
  referralCode: referralCodeSchema,
});
export type OnboardingResponse = z.infer<typeof onboardingResponseSchema>;

/**
 * PATCH /api/profile: update the signed-in user's name, role, department and year.
 * Used by the profile page and the onboarding step (/welcome). Fixed lists only,
 * because role and department go into the AI's system prompt.
 * Residents and specialists need a department; the year must fit the role.
 */
export const updateProfileRequestSchema = z
  .object({
    name: z.string().trim().min(1).max(120).optional(),
    specialty: z.enum(DEPARTMENTS).nullable().optional(),
    profession: z.enum(PROFESSION_VALUES).optional(),
    trainingYear: z.number().int().min(1).max(4).nullable().optional(),
  })
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: "Nothing to update",
  });
export type UpdateProfileRequest = z.infer<typeof updateProfileRequestSchema>;

export const updateProfileResponseSchema = z.object({ ok: z.literal(true) });
export type UpdateProfileResponse = z.infer<typeof updateProfileResponseSchema>;

