import NextLink from "next/link";
import type { ContributionSummary } from "@/components/account/ContributeNavigator";
import { contributionPill } from "@/components/account/statusPills";
import { StatusPill } from "@/components/ui/StatusPill";
import { Text } from "@/components/ui/Text";

/** Case study card in the list (design "Case studies"): title, status pill, meta line. */
export function ContributionCard({ contribution: c }: { contribution: ContributionSummary }) {
  const pill = contributionPill[c.status];
  return (
    <li>
      <NextLink
        href={`/contribute/${c.id}`}
        className="flex h-full flex-col gap-2.5 rounded-panel border border-ink/8 bg-paper px-4.5 py-4 shadow-card transition-[translate,border-color] duration-(--duration-border) hover:-translate-y-0.5 hover:border-ink/16"
      >
        <span className="flex items-start justify-between gap-2.5">
          <Text as="span" variant="item-title" className="text-pretty">
            {c.title}
          </Text>
          <StatusPill tone={pill.tone}>{pill.label}</StatusPill>
        </span>
        <Text as="span" variant="mono-sm" className="text-muted">
          {c.meta}
        </Text>
      </NextLink>
    </li>
  );
}
