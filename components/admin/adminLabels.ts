import type { StatusTone } from "@/components/ui/StatusPill";
import type { ApplicationStatus, ContributionStatus } from "@/lib/types";

type Pill = { label: string; tone: StatusTone };

/** Admin wording and tones (design/admin TONE map). */
export const applicationPill: Record<ApplicationStatus, Pill> = {
  pending: { label: "Pending", tone: "blue" },
  needs_info: { label: "Needs info", tone: "amber" },
  approved: { label: "Approved", tone: "ink" },
  rejected: { label: "Rejected", tone: "red" },
};

export const contributionReviewPill: Record<Exclude<ContributionStatus, "draft">, Pill> = {
  submitted: { label: "Submitted", tone: "blue" },
  needs_changes: { label: "Needs changes", tone: "amber" },
  approved: { label: "Approved", tone: "ink" },
  rejected: { label: "Rejected", tone: "red" },
};

/** Any status string from the audit log → pill. */
export function statusPill(status: string | null): Pill {
  if (!status) return { label: "—", tone: "grey" };
  const all: Record<string, Pill> = { ...applicationPill, ...contributionReviewPill };
  return all[status] ?? { label: status.replace(/_/g, " "), tone: "grey" };
}

const day = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", timeZone: "Asia/Kolkata" });
const dayTime = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Asia/Kolkata",
});

/** "25 Oct" from an ISO string, India time. */
export const isoDay = (iso: string) => day.format(new Date(iso));

/** "25 Oct, 08:30 am" from an ISO string, India time. */
export const isoDayTime = (iso: string) => dayTime.format(new Date(iso));

/** "$9.42" */
export const money = (usd: number) => `$${usd.toFixed(2)}`;

const longDay = new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", timeZone: "Asia/Kolkata" });

/** "Sunday 25 October" (India time) for the overview subtitle; runs at request time. */
export function todayLabel(now = new Date()): string {
  return longDay.format(now);
}
