import { clsx } from "clsx";
import type { ComponentPropsWithoutRef } from "react";
import { Icon } from "@/components/ui/Icon";
import type { IconName } from "@/components/ui/icons";

type IconButtonLook =
  | "light" // round light key: sidebar toggle, back
  | "accent" // round accent key: new chat, send
  | "outline" // hairline circle: attach
  | "ghost"; // bare circle that tints on hover: close

type IconButtonSize = "sm" | "md" | "lg";

type IconButtonProps = Omit<ComponentPropsWithoutRef<"button">, "children" | "aria-label"> & {
  icon: IconName;
  /** Accessible name; also shown as the tooltip. */
  label: string;
  look?: IconButtonLook;
  size?: IconButtonSize;
};

const lookClass: Record<IconButtonLook, string> = {
  light:
    "border border-line bg-linear-to-b from-key-light to-key-light-end text-ink shadow-key-light-icon active:translate-y-0.5",
  accent:
    "bg-linear-to-b from-accent-hi to-accent text-paper shadow-key-accent-sm hover:brightness-107 active:translate-y-0.5",
  outline: "border border-line-strong text-ink hover:bg-field",
  ghost: "text-copy hover:bg-field",
};

const sizeClass: Record<IconButtonSize, string> = { sm: "size-8.5", md: "size-10.5", lg: "size-11" };
const iconSize: Record<IconButtonSize, number> = { sm: 12, md: 16, lg: 18 };

/** A round, icon-only control. */
export function IconButton({
  icon,
  label,
  look = "light",
  size = "lg",
  type = "button",
  className,
  ...rest
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={clsx(
        "inline-flex shrink-0 cursor-pointer items-center justify-center rounded-full transition-[translate,filter,background-color] duration-(--duration-press) disabled:pointer-events-none disabled:opacity-45",
        lookClass[look],
        sizeClass[size],
        className,
      )}
      {...rest}
    >
      <Icon name={icon} size={iconSize[size]} />
    </button>
  );
}
