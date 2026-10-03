import type { ComponentPropsWithoutRef } from "react";
import { keyClassName, keyTextVariant, type KeyLook } from "@/components/ui/keyStyles";
import { Text } from "@/components/ui/Text";

type ButtonLinkProps = Omit<ComponentPropsWithoutRef<"a">, "href"> & {
  href: string;
  look: KeyLook;
};

/** A link styled as a pressable key (in-page anchors and store links). */
export function ButtonLink({ look, className, ...rest }: ButtonLinkProps) {
  return (
    <Text as="a" variant={keyTextVariant(look)} className={keyClassName(look, className)} {...rest} />
  );
}
