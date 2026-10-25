"use client";

import { useState } from "react";
import { contributionReviewPill, isoDay } from "@/components/admin/adminLabels";
import { DataTable } from "@/components/admin/DataTable";
import { PersonCell } from "@/components/admin/PersonCell";
import { PiiFlagPill } from "@/components/admin/PiiFlagPill";
import { TableToolbar } from "@/components/admin/TableToolbar";
import { TextCell } from "@/components/admin/TextCell";
import { TypeCell } from "@/components/admin/TypeCell";
import type { AdminContribution } from "@/lib/contracts/admin";

type Status = AdminContribution["status"];
const order: Status[] = ["submitted", "needs_changes", "approved", "rejected"];

const emptyCopy: Record<Status, { title: string; description?: string }> = {
  submitted: { title: "All caught up", description: "No contributions are waiting for review." },
  needs_changes: { title: "Nothing sent back", description: "Contributions you return for changes show up here." },
  approved: { title: "No approved contributions yet" },
  rejected: { title: "No rejected contributions" },
};

/** Case-study review queue. Static: filters fixtures; at integration useAdminContributions(status). */
export function ContributionsTable({ contributions }: { contributions: AdminContribution[] }) {
  const [tab, setTab] = useState<Status>("submitted");
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const list = contributions.filter(
    (c) => c.status === tab && [c.contributorName, c.id, c.title, c.specialty].some((v) => v.toLowerCase().includes(q)),
  );

  return (
    <div className="flex flex-col gap-4">
      <TableToolbar<Status>
        tabs={{
          label: "Contribution status",
          value: tab,
          onChange: setTab,
          segments: order.map((s) => ({
            value: s,
            label: contributionReviewPill[s].label,
            count: contributions.filter((c) => c.status === s).length,
          })),
        }}
        query={query}
        onQuery={setQuery}
        placeholder="Search contributor, code or title"
      />
      <DataTable
        label="Contributions"
        minWidth="55rem"
        columns={[
          { header: "Contributor", width: "minmax(18.75rem,2fr)" },
          { header: "Type", width: "6.875rem" },
          { header: "Specialty", width: "minmax(9.375rem,1fr)" },
          { header: "PII flags", width: "6.875rem" },
          { header: "Submitted", width: "minmax(6.875rem,0.8fr)" },
        ]}
        rows={list.map((c) => ({
          key: c.id,
          href: `/admin/contributions/${c.id}`,
          label: `Review ${c.title}`,
          cells: [
            <PersonCell key="p" name={c.contributorName} sub={`${c.id.toUpperCase()} · ${c.title}`} />,
            <TypeCell key="t" type={c.type} />,
            <TextCell key="s">{c.specialty}</TextCell>,
            <PiiFlagPill key="f" count={c.piiCheck?.flags.length ?? 0} />,
            <TextCell key="d" tone="muted">{isoDay(c.submittedAt)}</TextCell>,
          ],
        }))}
        empty={
          q ? { icon: "search", title: "No matches", description: "Try a different name or case code." } : { icon: "check", ...emptyCopy[tab] }
        }
        footer={list.length ? `${list.length} ${list.length === 1 ? "contribution" : "contributions"}` : undefined}
      />
    </div>
  );
}
