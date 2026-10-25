import { clsx } from "clsx";
import type { ComponentPropsWithoutRef } from "react";
import { Text } from "@/components/ui/Text";

/** Rounded multi-line field with an inset shadow (review notes, feedback reasons). */
export function TextArea({ className, ...rest }: ComponentPropsWithoutRef<"textarea">) {
  return (
    <Text
      as="textarea"
      variant="body-lg"
      className={clsx(
        "min-h-26 w-full resize-y rounded-tile border border-line bg-paper px-3.5 py-3 text-ink outline-none inset-shadow-field placeholder:text-faint focus:border-accent/45",
        className,
      )}
      {...rest}
    />
  );
}
