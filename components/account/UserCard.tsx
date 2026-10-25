"use client";

import { clsx } from "clsx";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { Icon } from "@/components/ui/Icon";
import { Text } from "@/components/ui/Text";

type UserCardProps = {
  name: string;
  /** e.g. "Cardiology · Verified doctor". */
  subtitle: string;
};

/** Signed-in user at the bottom of the sidebar; opens the profile. */
export function UserCard({ name, subtitle }: UserCardProps) {
  const active = usePathname().startsWith("/profile");
  return (
    <NextLink
      href="/profile"
      aria-current={active ? "page" : undefined}
      className={clsx(
        "flex h-16 items-center gap-3 rounded-full border bg-paper px-2.5 transition-[border-color,box-shadow] duration-(--duration-border)",
        active ? "border-accent/45 shadow-card-selected" : "border-ink/8 shadow-card-raised",
      )}
    >
      <Avatar name={name} size="lg" tone="dark" />
      <span className="min-w-0 flex-1">
        <Text as="span" variant="button-sm" className="block truncate">
          {name}
        </Text>
        <Text as="span" variant="meta" className="mt-0.5 block truncate text-muted">
          {subtitle}
        </Text>
      </span>
      <span className="flex size-10 items-center justify-center text-copy">
        <Icon name="settings" size={19} />
        <span className="sr-only">Profile and settings</span>
      </span>
    </NextLink>
  );
}
