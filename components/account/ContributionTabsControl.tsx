"use client";

import { useRouter } from "next/navigation";
import { contributionTabs, type ContributionTab } from "@/components/account/contributionTabs";
import { SegmentedControl } from "@/components/ui/SegmentedControl";

/** Drafts / In review / Reviewed with counts; switching updates ?tab=. */
export function ContributionTabsControl({ value, counts }: { value: ContributionTab; counts: Record<ContributionTab, number> }) {
  const router = useRouter();
  return (
    <SegmentedControl<ContributionTab>
      label="Case studies"
      value={value}
      onValueChange={(tab) => router.replace(`/contribute?tab=${tab}`, { scroll: false })}
      segments={contributionTabs.map((tab) => ({ value: tab.value, label: tab.label, count: counts[tab.value] }))}
      className="w-full max-w-110"
    />
  );
}
