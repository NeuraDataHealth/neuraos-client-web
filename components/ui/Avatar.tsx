import { clsx } from "clsx";
import { avatarTone, initials, type AvatarTone } from "@/components/ui/avatarTone";
import { Text } from "@/components/ui/Text";
import type { TextVariant } from "@/styles/typography";

export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

type AvatarProps = {
  name: string;
  size?: AvatarSize;
  /** Defaults to the name-hashed tone. */
  tone?: AvatarTone;
  /** White ring and edge, for overlapping stacks. */
  ring?: boolean;
  className?: string;
};

const toneClass: Record<AvatarTone, string> = {
  dark: "bg-linear-to-b from-key-dark to-key-dark-end text-paper inset-shadow-avatar-dark",
  accent: "bg-linear-to-b from-accent-hi to-accent text-paper inset-shadow-avatar-accent",
  light: "bg-linear-to-b from-key-light to-track text-ink inset-shadow-avatar-light",
};

const sizeClass: Record<AvatarSize, string> = {
  xs: "size-7.5",
  sm: "size-8.5",
  md: "size-10",
  lg: "size-12",
  xl: "size-15",
  "2xl": "size-19",
};

const textVariant: Record<AvatarSize, TextVariant> = {
  xs: "avatar-xs",
  sm: "avatar-sm",
  md: "avatar-md",
  lg: "avatar-lg",
  xl: "avatar-xl",
  "2xl": "avatar-2xl",
};

/** Initials avatar. Decorative: the name is always shown next to it. */
export function Avatar({ name, size = "md", tone, ring = false, className }: AvatarProps) {
  return (
    <Text
      as="span"
      aria-hidden="true"
      variant={textVariant[size]}
      className={clsx(
        "inline-flex shrink-0 items-center justify-center rounded-full",
        toneClass[tone ?? avatarTone(name)],
        sizeClass[size],
        ring && "border-2 border-paper shadow-avatar-ring",
        className,
      )}
    >
      {initials(name)}
    </Text>
  );
}
