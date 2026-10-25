import type { SVGProps } from "react";
import { icons, type IconDef, type IconName } from "@/components/ui/icons";

type IconProps = Omit<SVGProps<SVGSVGElement>, "viewBox" | "children"> & {
  name: IconName;
  /** Rendered width and height in px. */
  size?: number;
};

/** Decorative icon in `currentColor`. Give the control around it an accessible name. */
export function Icon({ name, size = 16, ...rest }: IconProps) {
  const icon: IconDef = icons[name];
  return (
    <svg
      viewBox={icon.viewBox}
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
      className="shrink-0"
      {...(icon.fill
        ? { fill: "currentColor" }
        : {
            fill: "none",
            stroke: "currentColor",
            strokeWidth: icon.strokeWidth,
            strokeLinecap: "round" as const,
            strokeLinejoin: "round" as const,
          })}
      {...rest}
    >
      <path d={icon.d} />
    </svg>
  );
}
