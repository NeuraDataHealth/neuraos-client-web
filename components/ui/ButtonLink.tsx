import NextLink from "next/link";
import type { ComponentPropsWithoutRef } from "react";
import { keyClassName, keyTextVariant, type KeyLook } from "@/components/ui/keyStyles";
import { Text } from "@/components/ui/Text";

type ButtonLinkProps = Omit<ComponentPropsWithoutRef<"a">, "href"> & {
  href: string;
  look: KeyLook;
};

/** A link styled as a pressable key: next/link for app routes, a plain <a> for anchors and other sites. */
export function ButtonLink({ look, className, href, ...rest }: ButtonLinkProps) {
  const props = { variant: keyTextVariant(look), className: keyClassName(look, className), href, ...rest };
  return href.startsWith("/") ? <Text as={NextLink} {...props} /> : <Text as="a" {...props} />;
}
