import NextLink from "next/link";
import { isoDayTime, statusPill } from "@/components/admin/adminLabels";
import type { AuditRow } from "@/components/admin/AuditTable";
import { Avatar } from "@/components/ui/Avatar";
import { Panel } from "@/components/ui/Panel";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { StatusChange } from "@/components/ui/StatusChange";
import { Text } from "@/components/ui/Text";

/** Latest audit entries on the overview. */
export function RecentActivity({ entries }: { entries: AuditRow[] }) {
  return (
    <section aria-labelledby="recent-activity">
      <SectionLabel
        id="recent-activity"
        aside={
          <Text as={NextLink} href="/admin/audit" variant="ui-xs" className="text-accent hover:text-accent-deep">
            View audit log
          </Text>
        }
      >
        Recent activity
      </SectionLabel>
      <Panel as="ul" divided>
        {entries.map((e) => (
          <li key={e.id} className="flex min-h-16.5 flex-wrap items-center gap-3.5 px-5 py-3">
            <Avatar name={e.actorName} size="sm" />
            <div className="min-w-55 flex-1">
              <Text variant="body">
                <span className="font-medium">{e.actionLabel}</span> · {e.targetLabel}
              </Text>
              <Text variant="meta-md" className="mt-0.5 text-muted">
                {e.actorName} · {isoDayTime(e.at)}
              </Text>
            </div>
            {(e.fromStatus || e.toStatus) && <StatusChange from={statusPill(e.fromStatus)} to={statusPill(e.toStatus)} />}
          </li>
        ))}
      </Panel>
    </section>
  );
}
