import { clsx } from "clsx";
import type { ComponentPropsWithoutRef } from "react";
import { Icon } from "@/components/ui/Icon";
import { Text } from "@/components/ui/Text";

type SearchFieldProps = Omit<ComponentPropsWithoutRef<"input">, "type"> & {
  /** Accessible name (visually hidden). */
  label: string;
};

/** 44px search pill with a magnifier (sidebar, admin tables). */
export function SearchField({ label, className, ...rest }: SearchFieldProps) {
  return (
    <label
      className={clsx(
        "flex h-11 min-w-0 items-center gap-2.25 rounded-full border border-line bg-paper px-3.5 inset-shadow-field focus-within:border-accent/45",
        className,
      )}
    >
      <span className="sr-only">{label}</span>
      <span className="text-muted">
        <Icon name="search" size={15} />
      </span>
      <Text
        as="input"
        type="search"
        variant="body"
        className="min-w-0 flex-1 bg-transparent text-ink outline-none placeholder:text-muted"
        {...rest}
      />
    </label>
  );
}
