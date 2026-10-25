import { clsx } from "clsx";

type MeterProps = {
  /** 0..1; clamped. */
  value: number;
  /** Accessible name, e.g. "Today's AI spend". */
  label: string;
  /** `dark` sits on a dark card. */
  theme?: "light" | "dark";
};

/** Usage bar: accent below 80 %, amber to 100 %, red at the cap (as designed). */
export function Meter({ value, label, theme = "light" }: MeterProps) {
  const v = Math.min(Math.max(value, 0), 1);
  const fill =
    v >= 1 ? "from-danger-hi to-danger" : v >= 0.8 ? "from-warn-hi to-warn" : "from-accent-hi to-accent";
  return (
    <span
      role="meter"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(v * 100)}
      className={clsx(
        "block overflow-hidden rounded-full",
        theme === "light" ? "h-3 bg-track inset-shadow-meter" : "h-2 bg-paper/12",
      )}
    >
      <span
        className={clsx(
          "block h-full rounded-full bg-linear-to-b transition-[width] duration-(--duration-state)",
          fill,
        )}
        style={{ width: `${v * 100}%` }}
      />
    </span>
  );
}
