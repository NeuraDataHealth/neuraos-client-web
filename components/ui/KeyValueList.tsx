import { clsx } from "clsx";
import type { ReactNode } from "react";
import { Text } from "@/components/ui/Text";

type KeyValueListProps = {
  items: { label: string; value: ReactNode }[];
  /**
   * `inline`: label column beside the value (case fields, user drawer).
   * `stacked`: label above the value in a responsive grid (applicant details).
   * `split`: label left, value right (contributor facts).
   */
  layout?: "inline" | "stacked" | "split";
  className?: string;
};

const rowClass = {
  inline: "grid grid-cols-[minmax(5.5rem,8.75rem)_minmax(0,1fr)] gap-4 py-3.5",
  stacked: "flex min-w-0 flex-col gap-1.25 py-3.25",
  split: "flex justify-between gap-3 py-2.5",
};

/** Label / value rows separated by hairlines. */
export function KeyValueList({ items, layout = "inline", className }: KeyValueListProps) {
  return (
    <dl
      className={clsx(
        layout === "stacked" && "grid grid-cols-[repeat(auto-fit,minmax(min(100%,15rem),1fr))] gap-x-7",
        className,
      )}
    >
      {items.map((item) => (
        <div key={item.label} className={clsx("border-b border-ink/7 last:border-b-0", rowClass[layout])}>
          <Text as="dt" variant={layout === "split" ? "body" : "key-label"} className="text-muted">
            {item.label}
          </Text>
          <Text
            as="dd"
            variant={layout === "split" ? "body" : "body-lg"}
            className={clsx("[overflow-wrap:anywhere]", layout === "split" ? "text-right" : "text-ink-soft")}
          >
            {item.value}
          </Text>
        </div>
      ))}
    </dl>
  );
}
