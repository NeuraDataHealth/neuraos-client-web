"use client";

import { useSearchParams } from "next/navigation";
import { ContributeNavigator, type ContributionSummary } from "@/components/account/ContributeNavigator";
import { isContributionTab } from "@/components/account/contributionTabs";

/** Reads ?tab= so the sidebar highlights the list tab; render inside <Suspense>. */
export function ContributeNavigatorWithTab({ contributions, onList }: { contributions: ContributionSummary[]; onList: boolean }) {
  const tab = useSearchParams().get("tab");
  return (
    <ContributeNavigator contributions={contributions} activeTab={onList ? (isContributionTab(tab) ? tab : "review") : null} />
  );
}
