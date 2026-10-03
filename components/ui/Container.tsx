import { clsx } from "clsx";
import type { HTMLAttributes } from "react";

type ContainerElement = "div" | "section" | "header" | "footer" | "nav" | "article";

export type ContainerInset = "page" | "wide";

export type ContainerProps = HTMLAttributes<HTMLElement> & {
  as?: ContainerElement;
  /** `page`: 20–48px side gutters. `wide`: 24–56px (footer). */
  inset?: ContainerInset;
};

const insetClass: Record<ContainerInset, string> = {
  page: "px-gutter",
  wide: "px-gutter-wide",
};

/** Full-bleed wrapper with the design's fluid side gutters (no max-width). */
export function Container({ as: Component = "div", inset = "page", className, ...rest }: ContainerProps) {
  return <Component className={clsx(insetClass[inset], className)} {...rest} />;
}
