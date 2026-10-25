import { clsx } from "clsx";

type GlowProps = {
  className?: string;
};

/** Soft accent halo (520–560px) centred on its position. Decorative; position with className. */
export function Glow({ className }: GlowProps) {
  return (
    <div
      aria-hidden="true"
      className={clsx(
        "pointer-events-none absolute size-135 -translate-x-1/2 -translate-y-1/2 rounded-full bg-(image:--gradient-glow)",
        className,
      )}
    />
  );
}
