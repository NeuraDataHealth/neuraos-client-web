import { clsx } from "clsx";

type SkeletonProps = {
  /** `line`: 10px bar; `circle`: avatar placeholder. */
  shape?: "line" | "circle";
  className?: string;
};

/** Loading placeholder. Wrap groups of skeletons in an element with aria-busy. */
export function Skeleton({ shape = "line", className }: SkeletonProps) {
  return (
    <span
      aria-hidden="true"
      className={clsx(
        "block shrink-0 bg-skeleton",
        shape === "line" ? "h-2.5 rounded-full" : "size-8.5 rounded-full",
        className,
      )}
    />
  );
}
