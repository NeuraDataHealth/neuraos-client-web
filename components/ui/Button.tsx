import { clsx } from "clsx";
import type { ComponentPropsWithoutRef } from "react";
import { keyClassName, keyTextVariant, type KeyLook } from "@/components/ui/keyStyles";
import { Text } from "@/components/ui/Text";

type ButtonProps = Omit<ComponentPropsWithoutRef<"button">, "type"> & {
  look: KeyLook;
  type?: "button" | "submit" | "reset";
};

/** A <button> styled as a pressable key (form actions). */
export function Button({ look, type = "button", className, ...rest }: ButtonProps) {
  return (
    <Text
      as="button"
      type={type}
      variant={keyTextVariant(look)}
      className={keyClassName(look, clsx("cursor-pointer disabled:cursor-progress", className))}
      {...rest}
    />
  );
}
