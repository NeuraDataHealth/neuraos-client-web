import type { StatusTone } from "@/components/ui/StatusPill";
import type { ApplicationStatus, ContributionStatus, VerificationStatus } from "@/lib/types";

type Pill = { label: string; tone: StatusTone };

/** Contribution status → pill, as in design/admin (In review is the contributor's word for submitted). */
export const contributionPill: Record<ContributionStatus, Pill> = {
  draft: { label: "Draft", tone: "grey" },
  submitted: { label: "In review", tone: "blue" },
  approved: { label: "Approved", tone: "ink" },
  needs_changes: { label: "Needs changes", tone: "amber" },
  rejected: { label: "Rejected", tone: "red" },
};

/** Verification status → pill. */
export const verificationPill: Record<VerificationStatus | ApplicationStatus, Pill> = {
  none: { label: "Not verified", tone: "grey" },
  pending: { label: "Pending", tone: "blue" },
  needs_info: { label: "Needs info", tone: "amber" },
  approved: { label: "Verified", tone: "dark" },
  rejected: { label: "Rejected", tone: "red" },
};
