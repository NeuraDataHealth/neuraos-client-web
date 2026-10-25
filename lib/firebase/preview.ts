/**
 * Dev-only static UI preview: skips Firebase Auth so pages render with fixtures
 * before .env.local is filled in. Never active in production builds.
 */
export const uiPreview =
  process.env.NODE_ENV !== "production" && process.env.NEXT_PUBLIC_UI_PREVIEW === "true";
