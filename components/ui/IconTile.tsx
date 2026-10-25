import { clsx } from "clsx";
import { Icon } from "@/components/ui/Icon";
import type { IconName } from "@/components/ui/icons";

type IconTileProps = {
  icon: IconName;
  /** `sm` 52px (empty table), `md` 60px (dead invite), `lg` 72px (access denied). */
  size?: "sm" | "md" | "lg";
};

const sizeClass = {
  sm: "size-13 rounded-callout shadow-key-light-sm",
  md: "size-15 rounded-panel shadow-key-light-lg",
  lg: "size-18 rounded-icon-tile shadow-key-light-lg",
};
const iconSize = { sm: 20, md: 24, lg: 28 };

/** Rounded light key holding a status icon. */
export function IconTile({ icon, size = "sm" }: IconTileProps) {
  return (
    <span
      aria-hidden="true"
      className={clsx(
        "flex shrink-0 items-center justify-center border border-line bg-linear-to-b from-key-light to-key-light-end",
        size === "lg" ? "text-ink" : "text-copy",
        sizeClass[size],
      )}
    >
      <Icon name={icon} size={iconSize[size]} />
    </span>
  );
}
