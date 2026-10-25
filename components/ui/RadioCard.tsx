import { clsx } from "clsx";
import type { ComponentPropsWithoutRef } from "react";
import { Text } from "@/components/ui/Text";

type RadioCardProps = Omit<ComponentPropsWithoutRef<"input">, "type"> & {
  title: string;
  description?: string;
};

/** Selectable option card with a radio dot (review decision). Group with the same `name`. */
export function RadioCard({ title, description, className, ...rest }: RadioCardProps) {
  return (
    <label
      className={clsx(
        "flex cursor-pointer items-center gap-3 rounded-tile border border-line bg-paper px-3.5 py-3 transition-[border-color,background-color] duration-(--duration-border) has-checked:border-accent/45 has-checked:bg-accent/4 has-checked:shadow-selected-ring has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-accent",
        className,
      )}
    >
      <input type="radio" className="peer sr-only" {...rest} />
      <span
        aria-hidden="true"
        className="flex size-4.5 shrink-0 items-center justify-center rounded-full border-[1.5px] border-ink/25 peer-checked:border-accent [&>span]:bg-transparent peer-checked:[&>span]:bg-accent"
      >
        <span className="size-2 rounded-full" />
      </span>
      <span className="min-w-0 flex-1">
        <Text as="span" variant="ui-md" className="block">
          {title}
        </Text>
        {description && (
          <Text as="span" variant="meta-md" className="mt-0.5 block text-muted">
            {description}
          </Text>
        )}
      </span>
    </label>
  );
}
