import type { ContributionStatus } from "@/lib/types";

export type ContributionTab = "drafts" | "review" | "reviewed";

export const contributionTabs: { value: ContributionTab; label: string; statuses: ContributionStatus[] }[] = [
  { value: "drafts", label: "Drafts", statuses: ["draft"] },
  { value: "review", label: "In review", statuses: ["submitted"] },
  { value: "reviewed", label: "Reviewed", statuses: ["approved", "needs_changes", "rejected"] },
];

export function isContributionTab(value: unknown): value is ContributionTab {
  return contributionTabs.some((tab) => tab.value === value);
}

export function tabOf(status: ContributionStatus): ContributionTab {
  return contributionTabs.find((tab) => tab.statuses.includes(status))?.value ?? "drafts";
}
