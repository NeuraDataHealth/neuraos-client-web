/**
 * The NeuraOS type scale. This is the only place text styles are defined;
 * render text through <Text variant="..."> (components/ui/Text.tsx).
 *
 * - Display and heading sizes are fluid, exactly as in the design.
 * - `lead` and `title` ease down 1–2px on small screens.
 * - UI text sits in fixed-height controls, so it keeps the design's size.
 * - `device-*` styles belong to the fixed-size phone mockup.
 * - `wordmark` sizes to its container: its parent needs the `@container` class.
 */
export const typography = {
  display:
    "font-sans font-light text-[length:clamp(2.75rem,min(9vw,13vh),8.75rem)] leading-[0.92] tracking-[-0.055em]",
  "display-cta":
    "font-sans font-light text-[length:clamp(2.75rem,7vw,6.5rem)] leading-[0.92] tracking-[-0.05em]",
  heading:
    "font-sans font-light text-[length:clamp(2.5rem,5.4vw,4.75rem)] leading-[0.95] tracking-[-0.045em]",
  "heading-compact":
    "font-sans font-light text-[length:clamp(2.5rem,4.6vw,4rem)] leading-[0.95] tracking-[-0.045em]",
  subheading:
    "font-sans font-light text-[length:clamp(1.625rem,2.6vw,2.25rem)] leading-[1.1] tracking-[-0.03em]",
  quote:
    "font-sans font-light text-[length:clamp(1.75rem,min(5.2vw,8vh),6rem)] leading-[1.02] tracking-[-0.045em]",
  // 19.9cqi = 96% of the container for logo + gap + "NeuraOS" (Geist 600 measures 4.3em).
  wordmark:
    "font-sans font-semibold text-[length:clamp(3rem,19.9cqi,15.625rem)] leading-[0.73] tracking-[-0.06em]",

  lead: "font-sans font-normal text-[length:clamp(1rem,0.979rem_+_0.104vw,1.0625rem)] leading-[1.55]",
  title:
    "font-sans font-normal text-[length:clamp(1.125rem,1.083rem_+_0.208vw,1.25rem)] leading-[1] tracking-[-0.01em]",
  brand: "font-sans font-semibold text-[length:1.0625rem] leading-[1] tracking-[-0.01em]",
  button: "font-sans font-medium text-[length:0.9375rem] leading-[1]",
  "button-sm": "font-sans font-medium text-[length:0.875rem] leading-[1]",
  body: "font-sans font-normal text-[length:0.875rem] leading-[1.5]",
  link: "font-sans font-normal text-[length:0.875rem] leading-[1]",
  toast: "font-sans font-medium text-[length:0.9375rem] leading-[1] tracking-[-0.01em]",
  chip: "font-sans font-medium text-[length:0.8125rem] leading-[1]",
  caption: "font-sans font-normal text-[length:0.8125rem] leading-[1.5]",

  mono: "font-mono font-normal text-[length:0.875rem] leading-[1.5]",
  "mono-sm": "font-mono font-normal text-[length:0.75rem] leading-[1.25rem]",
  overline: "font-mono font-normal text-[length:0.75rem] leading-[1] tracking-[0.1em] uppercase",
  "overline-sm":
    "font-mono font-normal text-[length:0.6875rem] leading-[1] tracking-[0.12em] uppercase",
  kicker: "font-mono font-medium text-[length:0.75rem] leading-[1] tracking-[0.14em] uppercase",
  attribution:
    "font-mono font-normal text-[length:0.75rem] leading-[1] tracking-[0.14em] uppercase",
  badge: "font-mono font-medium text-[length:0.6875rem] leading-[1] tracking-[0.12em] uppercase",

  "device-status": "font-sans font-semibold text-[length:0.8125rem] leading-[1]",
  "device-label": "font-sans font-medium text-[length:0.8125rem] leading-[1]",
  "device-body": "font-sans font-normal text-[length:0.8125rem] leading-[1.45]",
  "device-small": "font-sans font-normal text-[length:0.78125rem] leading-[1.4]",
  "device-copy": "font-sans font-normal text-[length:0.78125rem] leading-[1.55]",
  "device-tag": "font-mono font-normal text-[length:0.78125rem] leading-[1.4]",
  "device-meta": "font-mono font-normal text-[length:0.65625rem] leading-[1]",
} as const satisfies Record<string, string>;

export type TextVariant = keyof typeof typography;
