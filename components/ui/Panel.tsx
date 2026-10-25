import { clsx } from "clsx";
import type { HTMLAttributes } from "react";

type PanelElement = "div" | "section" | "article" | "ul" | "ol" | "dl" | "form";

type PanelProps = HTMLAttributes<HTMLElement> & {
  as?: PanelElement;
  /** `lg`: 22px corners (headers, stat cards). `md`: 20px (lists, forms). */
  size?: "md" | "lg";
  /** `flat`: edge only (drawer cards). */
  elevation?: "card" | "flat";
  /** Dividers between direct children, for row lists. */
  divided?: boolean;
};

/** White card on the app background. Add padding with className. */
export function Panel({
  as: Component = "div",
  size = "md",
  elevation = "card",
  divided = false,
  className,
  ...rest
}: PanelProps) {
  return (
    <Component
      className={clsx(
        "border border-ink/8 bg-paper",
        size === "lg" ? "rounded-panel-lg" : "rounded-panel",
        elevation === "card" ? "shadow-card" : "shadow-card-sm",
        divided && "divide-y divide-ink/7 overflow-hidden",
        className,
      )}
      {...rest}
    />
  );
}
