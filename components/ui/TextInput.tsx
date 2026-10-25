import { clsx } from "clsx";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { Text } from "@/components/ui/Text";

type TextInputProps = Omit<ComponentPropsWithoutRef<"input">, "size" | "prefix"> & {
  /** Text or symbol before the value, e.g. "$". */
  prefix?: ReactNode;
  /** Mono value (amounts, codes). */
  mono?: boolean;
};

/** 50px pill field with an inset shadow (spend cap, standalone inputs). Label it with <label htmlFor>. */
export function TextInput({ prefix, mono = false, className, ...rest }: TextInputProps) {
  return (
    <span
      className={clsx(
        "flex h-12.5 items-center gap-1.5 rounded-full border border-line-strong bg-paper px-4.5 inset-shadow-field focus-within:border-accent/45",
        className,
      )}
    >
      {prefix && (
        <Text as="span" variant="input" className="text-muted">
          {prefix}
        </Text>
      )}
      <Text
        as="input"
        variant={mono ? "input-mono" : "input"}
        className="min-w-0 flex-1 bg-transparent text-ink outline-none placeholder:text-faint"
        {...rest}
      />
    </span>
  );
}
