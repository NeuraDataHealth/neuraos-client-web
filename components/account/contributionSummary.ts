import { shortDate } from "@/components/account/dates";
import type { ContributionSummary } from "@/components/account/ContributeNavigator";
import { contributionPill } from "@/components/account/statusPills";
import type { ContributionDoc } from "@/lib/types";

/** Sidebar / list line for a contribution: "Voice · Draft · 24 Oct". */
export function contributionSummary(c: ContributionDoc & { id: string }): ContributionSummary {
  const when = c.reviewedAt ?? c.submittedAt ?? c.createdAt;
  const kind = c.type === "voice" ? "Voice" : "Text";
  return { id: c.id, title: c.title, status: c.status, meta: `${kind} · ${contributionPill[c.status].label} · ${shortDate(when)}` };
}
