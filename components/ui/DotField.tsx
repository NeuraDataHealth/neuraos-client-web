import { clsx } from "clsx";

type DotFieldProps = {
  /** Where the visible patch of dots sits: `high` (join) or `center` (home, access denied). */
  focus?: "high" | "center";
};

/** Masked dot grid behind standalone app screens. Decorative. */
export function DotField({ focus = "center" }: DotFieldProps) {
  return (
    <div
      aria-hidden="true"
      className={clsx(
        "pointer-events-none absolute inset-0 bg-(image:--gradient-dots) bg-size-[16px_16px]",
        focus === "high" ? "mask-(--mask-dots-high)" : "mask-(--mask-dots-center)",
      )}
    />
  );
}
