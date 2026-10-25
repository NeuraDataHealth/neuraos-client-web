import { clsx } from "clsx";
import type { ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";
import { Text } from "@/components/ui/Text";

type NoticeProps = {
  /**
   * `warning`: amber callout with an icon (patient-identifier notice).
   * `info`: grey callout (group full, decision notes).
   * `empty`: dashed outline (no files, no contributions yet).
   */
  tone?: "warning" | "info" | "empty";
  children: ReactNode;
  className?: string;
};

const toneClass = {
  warning: "rounded-tile border border-notice-line bg-notice text-notice-text",
  info: "rounded-callout border border-ink/7 bg-callout text-ink-soft",
  empty: "rounded-callout border border-dashed border-ink/16 text-muted",
};

/** Inline callout. */
export function Notice({ tone = "info", children, className }: NoticeProps) {
  return (
    <Text
      as="div"
      variant={tone === "warning" ? "body-sm" : "body"}
      className={clsx(
        "flex items-start gap-2.5 text-pretty",
        tone === "warning" ? "px-3.5 py-3" : "px-4 py-3.5",
        toneClass[tone],
        className,
      )}
    >
      {tone === "warning" && (
        <span className="mt-0.5 text-notice-icon">
          <Icon name="warning" size={16} />
        </span>
      )}
      <div className="min-w-0 flex-1">{children}</div>
    </Text>
  );
}
