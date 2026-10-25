import { clsx } from "clsx";
import type { ComponentPropsWithoutRef } from "react";
import { Icon } from "@/components/ui/Icon";
import { Text } from "@/components/ui/Text";

type SelectProps = ComponentPropsWithoutRef<"select"> & {
  /** Accessible name when there is no visible <label>. */
  label?: string;
};

/** 44px light-key dropdown (admin specialty filter). */
export function Select({ label, className, children, ...rest }: SelectProps) {
  return (
    <span
      className={clsx(
        "relative flex h-11 items-center rounded-full border border-line-strong bg-linear-to-b from-key-light to-key-light-end shadow-key-light-sm",
        className,
      )}
    >
      <Text
        as="select"
        variant="button-sm"
        aria-label={label}
        className="h-full cursor-pointer appearance-none rounded-full bg-transparent pr-9.5 pl-4 text-ink outline-none"
        {...rest}
      >
        {children}
      </Text>
      <span className="pointer-events-none absolute right-4 text-copy">
        <Icon name="chevron-down" size={12} />
      </span>
    </span>
  );
}
