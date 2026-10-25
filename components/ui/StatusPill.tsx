import { clsx } from "clsx";
import type { ReactNode } from "react";
import { Text } from "@/components/ui/Text";

export type StatusTone = "blue" | "amber" | "ink" | "red" | "grey" | "dark";

type StatusPillProps = {
  tone: StatusTone;
  children: ReactNode;
  /** `md` is the 26px pill used in page headers. */
  size?: "sm" | "md";
  className?: string;
};

const toneClass: Record<StatusTone, string> = {
  blue: "border-accent/28 bg-accent/8 text-accent",
  amber: "border-amber-line bg-amber-wash text-amber-text",
  ink: "border-ink/16 bg-ink/5 text-ink",
  red: "border-danger/30 bg-danger/7 text-danger-text",
  grey: "border-ink/18 text-muted",
  dark: "border-ink bg-ink text-paper",
};

/** Mono uppercase status label. */
export function StatusPill({ tone, children, size = "sm", className }: StatusPillProps) {
  return (
    <Text
      as="span"
      variant="pill"
      className={clsx(
        "inline-flex shrink-0 items-center whitespace-nowrap rounded-full border",
        size === "sm" ? "h-6 px-2.25" : "h-6.5 px-2.5",
        toneClass[tone],
        className,
      )}
    >
      {children}
    </Text>
  );
}
