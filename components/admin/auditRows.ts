import type { AuditRow } from "@/components/admin/AuditTable";
import type { AdminApplication, AdminAuditLog, AdminContribution, AdminUser } from "@/lib/contracts/admin";

const verb: Record<string, string> = {
  approved: "Approved",
  rejected: "Rejected",
  needs_info: "Asked for info on",
  needs_changes: "Asked for changes to",
};

/** Audit entries with readable admin, action and target names. */
export function auditRows(
  logs: AdminAuditLog[],
  users: AdminUser[],
  applications: AdminApplication[],
  contributions: AdminContribution[],
): AuditRow[] {
  return logs.map((log) => {
    const kind = log.targetType === "verificationApplication" ? "application" : log.targetType === "contribution" ? "contribution" : "settings";
    const target =
      log.targetType === "verificationApplication"
        ? applications.find((a) => a.id === log.targetId)?.fullName
        : log.targetType === "contribution"
          ? contributions.find((c) => c.id === log.targetId)?.title
          : "App settings";
    return {
      ...log,
      actorName: users.find((u) => u.uid === log.actorUid)?.name ?? "Admin",
      actionLabel: kind === "settings" ? "Updated settings" : `${verb[log.toStatus ?? ""] ?? "Reviewed"} ${kind}`,
      targetLabel: target ?? log.targetId,
    };
  });
}
