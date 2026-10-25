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
  | "night-sm" // footer social links
  // App (chat, groups, admin): the edge stays put and the key nudges down 2px.
  | "app-accent-sm" // top bar "Invite", "Turn on" (40px)
  | "app-accent-md" // dialog primary (46px)
  | "app-accent-lg" // review decision, page primary (50px)
  | "app-accent-xl" // join card, submit (54px)
  | "app-light-xs" // "Generate new link" (38px)
  | "app-light-sm" // top bar "Make group", dialog cancel (40–46px)
  | "app-light-md" // dialog secondary (46px)
  | "app-light-lg" // "Save draft", "Go to NeuraOS" (50px)
  | "app-danger-md" // confirm remove / leave / reject (46px)
  | "app-dark-md" // "Needs info" decision (46px)
  | "app-danger-lg" // reject decision (50px)
  | "app-dark-lg" // request info / changes decision (50px)
  | "app-danger-outline" // "Leave group" (46px)
  | "app-danger-ghost" // "Revoke link", "Remove" (34–38px)
  | "app-silver-sm" // light key on a dark card (40px)
  | "app-night-ghost-sm"; // outlined key on a dark card (40px)

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

// App keys: hover brightens solid keys; press moves the whole key 2px (the design's style-active).
const appPress = "transition-[translate,filter,background-color] duration-(--duration-press) active:translate-y-0.5";
const appSolidHover = "hover:brightness-107";
const appDisabled = "disabled:pointer-events-none disabled:opacity-45";
const appTone = {
  danger: "bg-linear-to-b from-danger-hi to-danger text-paper",
  dark: "bg-linear-to-b from-key-dark to-ink text-paper",
  silver: "bg-linear-to-b from-key-light to-silver-end text-ink",
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
  "app-accent-sm": clsx(tone.accent, appPress, appSolidHover, appDisabled, "h-10 gap-2 px-4 shadow-key-accent-sm"),
  "app-accent-md": clsx(tone.accent, appPress, appSolidHover, appDisabled, "h-11.5 min-w-24 gap-2 px-5.5 shadow-key-accent-dialog"),
  "app-accent-lg": clsx(tone.accent, appPress, appSolidHover, appDisabled, "h-12.5 gap-2 px-6 shadow-key-accent-xl"),
  "app-accent-xl": clsx(tone.accent, appPress, appSolidHover, appDisabled, "h-13.5 gap-2.5 px-6 shadow-key-accent-xl"),
  "app-light-xs": clsx(tone.light, appPress, appDisabled, "h-9.5 gap-2 px-3.5 shadow-key-light-xs"),
  "app-light-sm": clsx(tone.light, appPress, appDisabled, "h-10 gap-2 px-4 shadow-key-light-sm"),
  "app-light-md": clsx(tone.light, appPress, appDisabled, "h-11.5 gap-2 px-5 shadow-key-light-sm"),
  "app-light-lg": clsx(tone.light, appPress, appDisabled, "h-12.5 gap-2 px-5.5 shadow-key-light-lg"),
  "app-danger-md": clsx(appTone.danger, appPress, "hover:brightness-106", appDisabled, "h-11.5 min-w-24 gap-2 px-5.5 shadow-key-danger"),
  "app-dark-md": clsx(appTone.dark, appPress, "hover:brightness-106", appDisabled, "h-11.5 min-w-24 gap-2 px-5.5 shadow-key-dark-dialog"),
  "app-danger-lg": clsx(appTone.danger, appPress, "hover:brightness-106", appDisabled, "h-12.5 gap-2 px-6 shadow-key-danger"),
  "app-dark-lg": clsx(appTone.dark, appPress, "hover:brightness-106", appDisabled, "h-12.5 gap-2 px-6 shadow-key-dark-dialog"),
  "app-danger-outline": clsx(appPress, appDisabled, "h-11.5 gap-2 border border-danger/30 px-4.5 text-danger-text hover:bg-danger-wash"),
  "app-danger-ghost": clsx(appPress, appDisabled, "h-9.5 gap-2 px-3.5 text-danger-text hover:bg-danger-wash"),
  "app-silver-sm": clsx(appTone.silver, appPress, appDisabled, "h-10 gap-2 px-4 shadow-key-silver"),
  "app-night-ghost-sm": clsx(appPress, appDisabled, "h-10 gap-2 border border-paper/16 px-4 text-on-dark hover:bg-paper/6"),
};

export function keyClassName(keyLook: KeyLook, className?: string) {
  return clsx(base, look[keyLook], className);
}

const appText: Partial<Record<KeyLook, TextVariant>> = {
  "app-accent-sm": "button-sm",
  "app-accent-md": "ui-md",
  "app-accent-lg": "button",
  "app-accent-xl": "ui-lg",
  "app-light-xs": "ui-sm",
  "app-light-sm": "button-sm",
  "app-light-md": "ui-md",
  "app-light-lg": "button",
  "app-danger-md": "ui-md",
  "app-dark-md": "ui-md",
  "app-danger-lg": "button",
  "app-dark-lg": "button",
  "app-danger-outline": "ui-md",
  "app-danger-ghost": "ui-sm",
  "app-silver-sm": "button-sm",
  "app-night-ghost-sm": "button-sm",
};

/** Small keys use the smaller button text; app keys use the design's size per look. */
export function keyTextVariant(keyLook: KeyLook): TextVariant {
  const app = appText[keyLook];
  if (app) return app;
  return keyLook === "dark-sm" || keyLook === "night-sm" ? "button-sm" : "button";
}
