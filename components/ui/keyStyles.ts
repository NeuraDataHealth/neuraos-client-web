import { clsx } from "clsx";
import type { TextVariant } from "@/styles/typography";

/**
 * Pressable "key" buttons from the design: a gradient cap sitting on a solid
 * edge that collapses when pressed. Each look is a tone + size pair the
 * design actually uses.
 */
export type KeyLook =
  | "dark-sm" // nav "Get the app"
  | "dark-lg" // Google Play
  | "accent-md" // hero "Download"
  | "accent-lg" // App Store
  | "accent-field" // footer "Subscribe", sits beside a 52px field
  | "light-md"; // hero "See how it thinks"

const base =
  "inline-flex shrink-0 select-none items-center justify-center whitespace-nowrap rounded-full transition-[translate,box-shadow] duration-(--duration-press)";

const tone = {
  dark: "bg-linear-to-b from-key-dark to-key-dark-end text-paper",
  accent: "bg-linear-to-b from-accent-hi to-accent text-paper",
  light: "border border-line-strong bg-linear-to-b from-key-light to-key-light-end text-ink",
};

const look: Record<KeyLook, string> = {
  "dark-sm": clsx(
    tone.dark,
    "h-10 px-4.5 shadow-key-dark-sm active:translate-y-0.75 active:shadow-key-dark-sm-pressed",
  ),
  "dark-lg": clsx(
    tone.dark,
    "h-14 px-7 shadow-key-dark-lg active:translate-y-1 active:shadow-key-dark-lg-pressed",
  ),
  "accent-md": clsx(
    tone.accent,
    "h-12.5 px-6 shadow-key-accent-md active:translate-y-1 active:shadow-key-accent-pressed",
  ),
  "accent-lg": clsx(
    tone.accent,
    "h-14 px-7 shadow-key-accent-lg active:translate-y-1 active:shadow-key-accent-pressed",
  ),
  "accent-field": clsx(
    tone.accent,
    "h-13 px-6 shadow-key-accent-flat active:translate-y-1 active:shadow-key-accent-flat-pressed",
  ),
  "light-md": clsx(
    tone.light,
    "h-12.5 px-6 shadow-key-light-md active:translate-y-1 active:shadow-key-light-md-pressed",
  ),
};

export function keyClassName(keyLook: KeyLook, className?: string) {
  return clsx(base, look[keyLook], className);
}

/** Small keys use the smaller button text. */
export function keyTextVariant(keyLook: KeyLook): TextVariant {
  return keyLook === "dark-sm" ? "button-sm" : "button";
}
