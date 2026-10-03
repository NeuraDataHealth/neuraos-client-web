import { clsx } from "clsx";
import type { ComponentPropsWithoutRef } from "react";
import { Text } from "@/components/ui/Text";
import type { TextVariant } from "@/styles/typography";

type LinkTone = "nav";

const toneClass: Record<LinkTone, string> = {
  nav: "text-ink-soft hover:text-accent",
};

type LinkProps = Omit<ComponentPropsWithoutRef<"a">, "href"> & {
  href: string;
  variant?: TextVariant;
  tone?: LinkTone;
};

/** Plain text link (in-page anchors and external URLs) with the accent hover. */
export function Link({ variant = "body", tone = "nav", className, ...rest }: LinkProps) {
  return (
    <Text
      as="a"
      variant={variant}
      className={clsx(toneClass[tone], "transition-colors duration-(--duration-hover)", className)}
      {...rest}
    />
  );
}
