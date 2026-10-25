import type { ReactNode } from "react";
import { LogoMark } from "@/components/ui/LogoMark";
import { Text } from "@/components/ui/Text";

type AppBrandProps = {
  /** Optional pill after the name, e.g. <StatusPill tone="dark">Admin</StatusPill>. */
  badge?: ReactNode;
};

/** Logo mark + "NeuraOS" for app sidebars and standalone screens. */
export function AppBrand({ badge }: AppBrandProps) {
  return (
    <span className="flex items-center gap-2.5">
      <LogoMark className="size-6.5 text-ink" />
      <Text as="span" variant="app-brand">
        NeuraOS
      </Text>
      {badge}
    </span>
  );
}
