"use client";

import { useState } from "react";
import { applicationPill, isoDay } from "@/components/admin/adminLabels";
import { DataTable } from "@/components/admin/DataTable";
import { PersonCell } from "@/components/admin/PersonCell";
import { TableToolbar } from "@/components/admin/TableToolbar";
import { TextCell } from "@/components/admin/TextCell";
import type { AdminApplication } from "@/lib/contracts/admin";
import type { ApplicationStatus } from "@/lib/types";

const order: ApplicationStatus[] = ["pending", "needs_info", "approved", "rejected"];

const emptyCopy: Record<ApplicationStatus, { title: string; description?: string }> = {
  pending: { title: "All caught up", description: "No applications are waiting for review." },
  needs_info: { title: "Nothing waiting on applicants", description: "Applications you send back for more info show up here." },
  approved: { title: "No approved applications yet" },
  rejected: { title: "No rejected applications" },
};

/** Verification queue: status tabs, search, specialty filter. Static: filters fixtures; at integration useApplications(status). */
export function ApplicationsTable({ applications, emails }: { applications: AdminApplication[]; emails: Record<string, string> }) {
  const [tab, setTab] = useState<ApplicationStatus>("pending");
  const [query, setQuery] = useState("");
  const [specialty, setSpecialty] = useState("");

  const q = query.trim().toLowerCase();
  const filtered = !!q || !!specialty;
  const list = applications.filter(
    (a) =>
      a.status === tab &&
      (!specialty || a.specialty === specialty) &&
      [a.fullName, emails[a.uid] ?? "", a.registrationNumber, a.institution, a.councilName].some((v) => v.toLowerCase().includes(q)),
  );

  return (
    <div className="flex flex-col gap-4">
      <TableToolbar<ApplicationStatus>
        tabs={{
          label: "Application status",
          value: tab,
          onChange: setTab,
          segments: order.map((s) => ({
            value: s,
            label: applicationPill[s].label,
            count: applications.filter((a) => a.status === s).length,
          })),
        }}
        query={query}
        onQuery={setQuery}
        placeholder="Search name, email or reg. no."
        specialty={{ value: specialty, onChange: setSpecialty }}
      />
      <DataTable
        label="Applications"
        minWidth="66.25rem"
        columns={[
          { header: "Name", width: "minmax(13.75rem,1.5fr)" },
          { header: "Specialty", width: "minmax(8.75rem,1fr)" },
          { header: "Registration no.", width: "minmax(8.75rem,1fr)" },
          { header: "Medical council", width: "minmax(11.875rem,1.3fr)" },
          { header: "Institution", width: "minmax(10.625rem,1.2fr)" },
          { header: "Submitted", width: "minmax(6.875rem,0.8fr)" },
        ]}
        rows={list.map((a) => ({
          key: a.id,
          href: `/admin/applications/${a.id}`,
          label: `Review ${a.fullName}`,
          cells: [
            <PersonCell key="p" name={a.fullName} sub={emails[a.uid]} />,
            <TextCell key="s">{a.specialty}</TextCell>,
            <TextCell key="r" tone="mono">{a.registrationNumber}</TextCell>,
            <TextCell key="c" tone="muted">{a.councilName}</TextCell>,
            <TextCell key="i" tone="muted">{a.institution}</TextCell>,
            <TextCell key="d" tone="muted">{isoDay(a.submittedAt)}</TextCell>,
          ],
        }))}
        empty={
          filtered
            ? { icon: "search", title: "No matches", description: "Try a different name or specialty." }
            : { icon: "check", ...emptyCopy[tab] }
        }
        footer={list.length ? `${list.length} ${list.length === 1 ? "application" : "applications"}` : undefined}
      />
    </div>
  );
}
