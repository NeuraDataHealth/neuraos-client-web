import { clsx } from "clsx";
import { Icon } from "@/components/ui/Icon";
import type { IconName } from "@/components/ui/icons";
import { Text } from "@/components/ui/Text";

export type Segment<T extends string> = {
  value: T;
  label: string;
  count?: number;
  icon?: IconName;
};

type SegmentedControlProps<T extends string> = {
  segments: Segment<T>[];
  value: T;
  onValueChange: (value: T) => void;
  /** Accessible name for the group. */
  label: string;
  /** `md`: 46px track (tabs, modes). `sm`: 34px inline (preferences). */
  size?: "md" | "sm";
  className?: string;
};

/** Pill track with a raised selected segment, optionally with counts. */
export function SegmentedControl<T extends string>({
  segments,
  value,
  onValueChange,
  label,
  size = "md",
  className,
}: SegmentedControlProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={clsx(
        "rounded-full bg-track inset-shadow-track",
        size === "md" ? "grid h-11.5 auto-cols-fr grid-flow-col gap-1 p-1" : "inline-flex h-8.5 gap-0.75 p-0.75",
        className,
      )}
    >
      {segments.map((segment) => {
        const on = segment.value === value;
        return (
          <button
            key={segment.value}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onValueChange(segment.value)}
            className={clsx(
              "flex min-w-0 cursor-pointer items-center justify-center gap-2 rounded-full whitespace-nowrap transition-[background-color,box-shadow,color] duration-(--duration-border)",
              size === "md" ? "px-1.5" : "px-3",
              on ? "bg-linear-to-b from-key-light to-segment-end text-ink shadow-segment" : "text-muted",
            )}
          >
            {segment.icon && <Icon name={segment.icon} size={15} />}
            <Text as="span" variant={size === "md" ? "button-sm" : "ui-xs"} className="truncate">
              {segment.label}
            </Text>
            {segment.count !== undefined && (
              <Text as="span" variant="mono-meta" className={on ? "text-accent" : "text-faint"}>
                {segment.count}
              </Text>
            )}
          </button>
        );
      })}
    </div>
  );
}
