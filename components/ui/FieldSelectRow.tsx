import { clsx } from "clsx";
import type { ComponentPropsWithoutRef } from "react";
import { Icon } from "@/components/ui/Icon";
import { Text } from "@/components/ui/Text";

type FieldSelectRowProps = ComponentPropsWithoutRef<"select"> & {
  label: string;
};

/** Labelled dropdown row inside a divided Panel (specialty, role). */
export function FieldSelectRow({ label, className, children, ...rest }: FieldSelectRowProps) {
  return (
    <label
      className={clsx("relative flex cursor-pointer flex-col gap-1.5 px-4.5 pt-3 pb-3.25 focus-within:bg-callout", className)}
    >
      <Text as="span" variant="field-label" className="text-muted">
        {label}
      </Text>
      <Text
        as="select"
        variant="body-lg"
        className="w-full min-w-0 cursor-pointer appearance-none bg-transparent pr-6 text-ink outline-none"
        {...rest}
      >
        {children}
      </Text>
      <span className="pointer-events-none absolute right-4.5 bottom-4.5 text-faint">
        <Icon name="chevron-down" size={12} />
      </span>
    </label>
  );
}
