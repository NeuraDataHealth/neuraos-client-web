import NextLink from "next/link";
import { money, spendStatus } from "@/components/admin/adminLabels";
import { Meter } from "@/components/ui/Meter";
import { Text } from "@/components/ui/Text";

type SpendCardProps = {
  /** Today's spend in USD; null until the first load. */
  spend: number | null;
  cap: number;
  /** The last load failed. */
  failed: boolean;
};

/** Dark overview tile: today's AI spend against the daily cap; opens Settings. */
export function SpendCard({ spend, cap, failed }: SpendCardProps) {
  const share = spend === null ? 0 : cap > 0 ? spend / cap : 1;
  return (
    <NextLink
      href="/admin/settings"
      className="flex min-h-40 flex-col gap-3 rounded-panel-lg bg-linear-to-b from-key-dark to-ink p-4.5 text-on-dark shadow-dark-card"
    >
      <Text as="span" variant="stat-label" className="text-on-dark-muted">
        Today&apos;s AI spend
      </Text>
      <span className="flex flex-wrap items-baseline gap-2">
        <Text as="span" variant="stat">
          {spend === null ? "—" : money(spend)}
        </Text>
        <Text as="span" variant="caption" className="text-on-dark-muted">
          of {money(cap)}
        </Text>
      </span>
      <span className="mt-auto flex w-full flex-col gap-2">
        <Meter value={share} label="Today's AI spend against the daily cap" theme="dark" />
        <Text as="span" variant="mono-meta" className="text-on-dark-muted">
          {spendStatus(spend, share, failed)}
        </Text>
      </span>
    </NextLink>
  );
}
