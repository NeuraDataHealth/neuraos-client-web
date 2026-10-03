import { clsx } from "clsx";
import type { TextVariant } from "@/styles/typography";

/**
 * Pressable "key" buttons from the design: a gradient cap sitting on a solid
 * edge that collapses when pressed. Each look is a tone + size pair the
 * design actually uses.
 */
export type KeyLook =
  | "dark-sm" // nav "Try it"
  | "dark-lg" // Google Play
  | "accent-md" // hero "Try it on web"
  | "accent-lg" // App Store
  | "light-md" // hero "See how it thinks"
  | "night-sm"; // footer social links

const base =
  "inline-flex shrink-0 select-none items-center justify-center whitespace-nowrap rounded-full";

const press = "transition-[translate,box-shadow] duration-(--duration-press)";

const tone = {
  dark: "bg-linear-to-b from-key-dark to-key-dark-end text-paper",
  accent: "bg-linear-to-b from-accent-hi to-accent text-paper",
  light: "border border-line-strong bg-linear-to-b from-key-light to-key-light-end text-ink",
  // Border brightens on hover over its own (slower) transition, as designed.
  night:
    "border border-night-border bg-linear-to-b from-night-key to-night-key-end text-night-fg hover:border-paper/30 [transition:translate_var(--duration-press),box-shadow_var(--duration-press),border-color_var(--duration-border)]",
};

const look: Record<KeyLook, string> = {
  "dark-sm": clsx(
    tone.dark,
    press,
    "h-10 px-4.5 shadow-key-dark-sm active:translate-y-0.75 active:shadow-key-dark-sm-pressed",
  ),
  "dark-lg": clsx(
    tone.dark,
    press,
    "h-14 px-7 shadow-key-dark-lg active:translate-y-1 active:shadow-key-dark-lg-pressed",
  ),
  "accent-md": clsx(
    tone.accent,
    press,
    "h-12.5 px-6 shadow-key-accent-md active:translate-y-1 active:shadow-key-accent-pressed",
  ),
  "accent-lg": clsx(
    tone.accent,
    press,
    "h-14 px-7 shadow-key-accent-lg active:translate-y-1 active:shadow-key-accent-pressed",
  ),
  "light-md": clsx(
    tone.light,
    press,
    "h-12.5 px-6 shadow-key-light-md active:translate-y-1 active:shadow-key-light-md-pressed",
  ),
  "night-sm": clsx(
    tone.night,
    "h-12 gap-2.5 pr-4.5 pl-5 shadow-key-night active:translate-y-0.75 active:shadow-key-night-pressed",
  ),
};

export function keyClassName(keyLook: KeyLook, className?: string) {
  return clsx(base, look[keyLook], className);
}

/** Small keys use the smaller button text. */
export function keyTextVariant(keyLook: KeyLook): TextVariant {
  return keyLook === "dark-sm" || keyLook === "night-sm" ? "button-sm" : "button";
}
