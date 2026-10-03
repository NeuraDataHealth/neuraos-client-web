import { clsx } from "clsx";
import type { ComponentPropsWithoutRef, ElementType } from "react";
import { typography, type TextVariant } from "@/styles/typography";

type TextProps<T extends ElementType> = {
  /** Element to render; defaults to <p>. */
  as?: T;
  variant: TextVariant;
  className?: string;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "variant" | "className">;

export function Text<T extends ElementType = "p">({
  as,
  variant,
  className,
  ...rest
}: TextProps<T>) {
  const Component: ElementType = as ?? "p";
  return <Component className={clsx(typography[variant], className)} {...rest} />;
}
