import { z } from "zod";

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
