import { isoDayTime, statusPill } from "@/components/admin/adminLabels";
import type { TimelineEntry } from "@/components/ui/Timeline";

type Reviewable = {
  id: string;
  status: string;
  submittedAt: string;
  reviewedAt: string | null;
  reviewNote: string | null;
};

const dot = (status: string): TimelineEntry["tone"] =>
  status === "approved" ? "ink" : status === "rejected" ? "red" : status === "needs_info" || status === "needs_changes" ? "amber" : "accent";

/** Submitted → latest decision, for review pages and the user drawer. */
export function reviewHistory(item: Reviewable, who: string, reviewer: string): TimelineEntry[] {
  const entries: TimelineEntry[] = [
    { id: `${item.id}-submitted`, title: "Submitted", meta: `${who} · ${isoDayTime(item.submittedAt)}`, tone: "accent" },
  ];
  if (item.reviewedAt) {
    entries.push({
      id: `${item.id}-reviewed`,
      title: statusPill(item.status).label,
      meta: `${reviewer} · ${isoDayTime(item.reviewedAt)}`,
      note: item.reviewNote ?? undefined,
      tone: dot(item.status),
    });
  }
  return entries;
}
