import type { Metadata } from "next";
import { TopBar } from "@/components/app/TopBar";
import { AuditTable } from "@/components/admin/AuditTable";
import { auditRows } from "@/components/admin/auditRows";
import { adminApplications, adminAuditLogs, adminContributions, adminUsers } from "@/lib/fixtures/admin";

export const metadata: Metadata = { title: "Audit log — NeuraOS admin" };

export default function AdminAuditPage() {
  return (
    <main id="main" className="flex min-h-0 flex-1 flex-col">
      <TopBar title="Audit log" subtitle="Every admin decision, newest first" />
      <div className="min-h-0 flex-1 overflow-auto px-4 pt-2 pb-14 app:px-7">
        <div className="mx-auto max-w-admin">
          <AuditTable entries={auditRows(adminAuditLogs, adminUsers, adminApplications, adminContributions)} />
        </div>
      </div>
    </main>
  );
}
