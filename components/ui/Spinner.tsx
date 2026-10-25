import { clsx } from "clsx";

type SpinnerProps = {
  /** Announced to screen readers; omit when nearby text already says it. */
  label?: string;
  className?: string;
};

/** Small accent ring for in-progress states (file processing, busy buttons). */
export function Spinner({ label, className }: SpinnerProps) {
  return (
    <span
      role={label ? "status" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={clsx(
        "inline-block size-3.5 shrink-0 animate-spin rounded-full border-2 border-accent/25 border-t-accent motion-reduce:animate-none",
        className,
      )}
    />
  );
}
