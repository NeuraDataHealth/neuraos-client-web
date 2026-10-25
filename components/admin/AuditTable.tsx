"use client";

import { useState } from "react";
import { isoDayTime, statusPill } from "@/components/admin/adminLabels";
import { DataTable } from "@/components/admin/DataTable";
import { PersonCell } from "@/components/admin/PersonCell";
import { TableToolbar } from "@/components/admin/TableToolbar";
import { TextCell } from "@/components/admin/TextCell";
import { StatusChange } from "@/components/ui/StatusChange";
import type { AdminAuditLog } from "@/lib/contracts/admin";

export type AuditRow = AdminAuditLog & { actorName: string; actionLabel: string; targetLabel: string };

/** Audit log, newest first, searchable. At integration useAuditLogs(). */
export function AuditTable({ entries }: { entries: AuditRow[] }) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const list = entries.filter((e) => [e.actorName, e.actionLabel, e.targetLabel, e.note ?? ""].some((v) => v.toLowerCase().includes(q)));

  return (
    <div className="flex flex-col gap-4">
      <TableToolbar query={query} onQuery={setQuery} placeholder="Search admin, action or target" />
      <DataTable
        label="Audit log"
        minWidth="76.25rem"
        columns={[
          { header: "Admin", width: "minmax(10.625rem,1fr)" },
          { header: "Action", width: "minmax(10.625rem,1fr)" },
          { header: "Target", width: "minmax(13.125rem,1.3fr)" },
          { header: "From → To", width: "minmax(15rem,1.3fr)" },
          { header: "Note", width: "minmax(13.75rem,1.6fr)" },
          { header: "Time", width: "8.125rem" },
        ]}
        rows={list.map((e) => ({
          key: e.id,
          cells: [
            <PersonCell key="a" name={e.actorName} />,
            <TextCell key="x">{e.actionLabel}</TextCell>,
            <TextCell key="t">{e.targetLabel}</TextCell>,
            e.fromStatus || e.toStatus ? (
              <StatusChange key="s" from={statusPill(e.fromStatus)} to={statusPill(e.toStatus)} />
            ) : (
              <TextCell key="s" tone="muted">—</TextCell>
            ),
            <TextCell key="n" tone="muted">{e.note ?? "—"}</TextCell>,
            <TextCell key="w" tone="mono">{isoDayTime(e.at)}</TextCell>,
          ],
        }))}
        empty={{ icon: "search", title: "No matches", description: "Try a different search." }}
        footer={list.length ? `${list.length} entries` : undefined}
      />
    </div>
  );
}
