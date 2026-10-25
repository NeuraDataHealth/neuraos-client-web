import { clsx } from "clsx";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";

type CheckboxProps = Omit<ComponentPropsWithoutRef<"input">, "type" | "children"> & {
  /** Label content beside the box. */
  children: ReactNode;
  className?: string;
};

/** Native checkbox with the design's 20px rounded box; the whole row is the label. */
export function Checkbox({ children, className, ...rest }: CheckboxProps) {
  return (
    <label className={clsx("flex cursor-pointer items-start gap-3", className)}>
      <input type="checkbox" className="peer sr-only" {...rest} />
      <span
        aria-hidden="true"
        className="mt-px flex size-5 shrink-0 items-center justify-center rounded-check border-[1.5px] border-ink/22 bg-paper text-transparent peer-checked:border-accent peer-checked:bg-linear-to-b peer-checked:from-accent-hi peer-checked:to-accent peer-checked:text-paper peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent"
      >
        <Icon name="check" size={11} />
      </span>
      <span className="min-w-0 flex-1">{children}</span>
    </label>
  );
}
