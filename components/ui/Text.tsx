import { clsx } from "clsx";
import type { ComponentProps, ElementType } from "react";
import { typography, type TextVariant } from "@/styles/typography";

type TextProps<T extends ElementType> = {
  /** Element to render; defaults to <p>. */
  as?: T;
  variant: TextVariant;
  className?: string;
} & Omit<ComponentProps<T>, "as" | "variant" | "className">;

export function Text<T extends ElementType = "p">({
  as,
  variant,
  className,
  ...rest
}: TextProps<T>) {
  const Component: ElementType = as ?? "p";
  return <Component className={clsx(typography[variant], className)} {...rest} />;
}
