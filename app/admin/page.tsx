import type { Metadata } from "next";
import { TopBar } from "@/components/app/TopBar";
import { todayLabel } from "@/components/admin/adminLabels";
import { auditRows } from "@/components/admin/auditRows";
import { RecentActivity } from "@/components/admin/RecentActivity";
import { SpendCard } from "@/components/admin/SpendCard";
import { StatCard } from "@/components/admin/StatCard";
import { adminApplications, adminAuditLogs, adminConfig, adminContributions, adminUsers, spendTodayUsd } from "@/lib/fixtures/admin";

export const metadata: Metadata = { title: "Admin — NeuraOS" };

/** Static: fixtures. At integration: useApplications / useAdminContributions / useAdminUsers / useConfig / useAuditLogs. */
export default function AdminOverviewPage() {
  const pending = adminApplications.filter((a) => a.status === "pending").length;
  const waiting = adminApplications.filter((a) => a.status === "needs_info").length;
  const toReview = adminContributions.filter((c) => c.status === "submitted");
  const flagged = toReview.filter((c) => (c.piiCheck?.flags.length ?? 0) > 0).length;
  const verified = adminUsers.filter((u) => u.verificationStatus === "approved").length;

  return (
    <main id="main" className="flex min-h-0 flex-1 flex-col">
      <TopBar title="Overview" subtitle={todayLabel()} />
      <div className="min-h-0 flex-1 overflow-auto px-4 pt-2 pb-14 app:px-7">
        <div className="mx-auto flex max-w-admin flex-col gap-7.5">
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,12.5rem),1fr))] gap-3.5">
            <StatCard label="Pending applications" value={String(pending)} sub={`${waiting} waiting on applicants`} href="/admin/applications" attention={pending > 0} />
            <StatCard label="Contributions to review" value={String(toReview.length)} sub={`${flagged} with PII flags`} href="/admin/contributions" attention={toReview.length > 0} />
            <StatCard label="Total users" value={String(adminUsers.length)} sub="All sign-ups" href="/admin/users" />
            <StatCard label="Verified doctors" value={String(verified)} sub={`${Math.round((verified / Math.max(1, adminUsers.length)) * 100)}% of users`} href="/admin/users" />
            <SpendCard spend={spendTodayUsd} cap={adminConfig.dailySpendCapUsd} />
          </div>
          <RecentActivity entries={auditRows(adminAuditLogs.slice(0, 5), adminUsers, adminApplications, adminContributions)} />
        </div>
      </div>
    </main>
  );
}
