import { clsx } from "clsx";
import type { ComponentPropsWithoutRef } from "react";
import { Text } from "@/components/ui/Text";

type FieldRowProps = ComponentPropsWithoutRef<"input"> & {
  label: string;
};

/** Labelled text row inside a divided Panel (profile details). */
export function FieldRow({ label, className, ...rest }: FieldRowProps) {
  return (
    <label className={clsx("flex flex-col gap-1.5 px-4.5 pt-3 pb-3.25 focus-within:bg-callout", className)}>
      <Text as="span" variant="field-label" className="text-muted">
        {label}
      </Text>
      <Text as="input" variant="body-lg" className="w-full min-w-0 bg-transparent text-ink outline-none" {...rest} />
    </label>
  );
}
