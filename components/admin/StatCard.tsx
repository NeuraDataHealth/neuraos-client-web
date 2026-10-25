import { clsx } from "clsx";
import NextLink from "next/link";
import { Text } from "@/components/ui/Text";

type StatCardProps = {
  label: string;
  value: string;
  sub: string;
  href: string;
  /** Accent number when something is waiting. */
  attention?: boolean;
};

/** Overview tile: mono label, big number, note; opens its list. */
export function StatCard({ label, value, sub, href, attention = false }: StatCardProps) {
  return (
    <NextLink
      href={href}
      className="flex min-h-40 flex-col items-start gap-3 rounded-panel-lg border border-ink/8 bg-paper p-4.5 shadow-card transition-[translate,border-color] duration-(--duration-border) hover:-translate-y-0.5 hover:border-ink/16"
    >
      <Text as="span" variant="stat-label" className="text-muted">
        {label}
      </Text>
      <Text as="span" variant="stat" className={clsx(attention ? "text-accent" : "text-ink")}>
        {value}
      </Text>
      <Text as="span" variant="caption" className="mt-auto text-muted">
        {sub}
      </Text>
    </NextLink>
  );
}
