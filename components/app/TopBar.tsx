import type { ReactNode } from "react";
import { SidebarToggle } from "@/components/app/SidebarToggle";
import { Text } from "@/components/ui/Text";

type TopBarProps = {
  title: string;
  /** Mono line under the title. */
  subtitle?: string;
  /** Right-hand actions. */
  children?: ReactNode;
};

/** 72px page header: sidebar toggle, title and actions. */
export function TopBar({ title, subtitle, children }: TopBarProps) {
  return (
    <header className="relative z-2 flex h-nav shrink-0 items-center gap-3.5 px-4 app:px-6">
      <SidebarToggle />
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
