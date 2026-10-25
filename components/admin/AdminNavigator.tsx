"use client";

import { clsx } from "clsx";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import type { IconName } from "@/components/ui/icons";
import { Text } from "@/components/ui/Text";

type AdminNavigatorProps = {
  /** Badge counts: pending applications, submitted contributions. */
  counts: { applications: number; contributions: number };
};

const items: { href: string; label: string; icon: IconName; count?: "applications" | "contributions" }[] = [
  { href: "/admin", label: "Overview", icon: "overview" },
  { href: "/admin/applications", label: "Applications", icon: "applications", count: "applications" },
  { href: "/admin/contributions", label: "Contributions", icon: "contributions", count: "contributions" },
  { href: "/admin/users", label: "Users", icon: "users" },
  { href: "/admin/settings", label: "Settings", icon: "sliders" },
  { href: "/admin/audit", label: "Audit log", icon: "audit" },
];

/** Admin sections with icons and review counts; the current section is raised. */
export function AdminNavigator({ counts }: AdminNavigatorProps) {
  const pathname = usePathname();
  return (
    <nav aria-label="Admin" className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-auto px-3.5 py-2.5">
      {items.map((item) => {
        const on = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
        const n = item.count ? counts[item.count] : 0;
        return (
          <Text
            key={item.href}
            as={NextLink}
            href={item.href}
            aria-current={on ? "page" : undefined}
            variant={on ? "button-sm" : "body"}
            className={clsx(
              "flex h-11 shrink-0 items-center gap-3 rounded-card border pr-2.5 pl-3.5",
              on ? "border-ink/8 bg-paper text-ink shadow-row-active" : "border-transparent text-copy hover:text-ink",
            )}
          >
            <Icon name={item.icon} size={18} />
            <span className="flex-1">{item.label}</span>
            {n > 0 && (
              <Text
                as="span"
                variant="count"
                className={clsx(
                  "flex h-5.5 min-w-5.5 items-center justify-center rounded-full px-1.75",
                  on ? "bg-accent/10 text-accent" : "bg-silver-end text-copy",
                )}
              >
                {n}
                <span className="sr-only"> waiting</span>
              </Text>
            )}
          </Text>
        );
      })}
    </nav>
  );
}
