import { clsx } from "clsx";
import type { ComponentPropsWithoutRef } from "react";

type ToggleProps = Omit<ComponentPropsWithoutRef<"button">, "onChange" | "aria-checked" | "role"> & {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  /** Accessible name when the visible label isn't linked with aria-labelledby. */
  label?: string;
};

/** 46×28 switch: accent when on, grey when off. */
export function Toggle({ checked, onCheckedChange, label, className, disabled, ...rest }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={clsx(
        "flex h-7 w-11.5 shrink-0 cursor-pointer items-center rounded-full p-0.75 inset-shadow-toggle transition-colors duration-(--duration-border) disabled:cursor-default disabled:opacity-45",
        checked ? "justify-end bg-linear-to-b from-accent-hi to-accent" : "justify-start bg-toggle-off",
        className,
      )}
      {...rest}
    >
      <span className="size-5.5 rounded-full bg-paper shadow-knob" />
    </button>
  );
}
