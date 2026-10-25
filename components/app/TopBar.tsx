import NextLink from "next/link";
import type { ReactNode } from "react";
import { SidebarToggle } from "@/components/app/SidebarToggle";
import { Icon } from "@/components/ui/Icon";
import { Text } from "@/components/ui/Text";

type TopBarProps = {
  title: string;
  /** Mono line under the title. */
  subtitle?: string;
  /** Shows a back key (admin review pages). */
  backHref?: string;
  /** Right-hand actions. */
  children?: ReactNode;
};

/** 72px page header: sidebar toggle, title and actions. */
export function TopBar({ title, subtitle, backHref, children }: TopBarProps) {
  return (
    <header className="relative z-2 flex h-nav shrink-0 items-center gap-3.5 px-4 app:px-6">
      <SidebarToggle />
      {backHref && (
        <NextLink
          href={backHref}
          aria-label="Back"
          title="Back"
          className="flex size-11 shrink-0 items-center justify-center rounded-full border border-line bg-linear-to-b from-key-light to-key-light-end text-ink shadow-key-light-icon active:translate-y-0.5"
        >
          <Icon name="back" size={16} />
        </NextLink>
      )}
      <div className="min-w-0 flex-1">
        <Text as="h1" variant="topbar-title" className="truncate">
          {title}
        </Text>
        {subtitle && (
          <Text variant="mono-meta" className="mt-0.75 truncate text-muted">
            {subtitle}
          </Text>
        )}
      </div>
      {children}
    </header>
  );
}
