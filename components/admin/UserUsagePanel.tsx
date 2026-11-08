"use client";

import { money } from "@/components/admin/adminLabels";
import { KeyValueList } from "@/components/ui/KeyValueList";
import { Notice } from "@/components/ui/Notice";
import { Panel } from "@/components/ui/Panel";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { useUserUsage } from "@/hooks/admin/useUserUsage";
import { errorMessage } from "@/lib/api/client";
import {
  AI_REPLIES_PER_DAY,
  CONTRIBUTIONS_PER_DAY,
  GROUP_JOINS_PER_DAY,
  GROUPS_CREATED_PER_DAY,
  UPLOAD_BYTES_PER_DAY,
  UPLOADS_PER_DAY,
  USER_DAILY_SPEND_CAP_USD,
} from "@/lib/limits";

const MB = 1024 * 1024;
const mb = (bytes: number) => `${(bytes / MB).toFixed(1)} MB`;

/** Today's counters for one user against the daily limits (lib/limits.ts). */
export function UserUsagePanel({ uid }: { uid: string }) {
  const usage = useUserUsage(uid);
  const u = usage.data;

  return (
    <section aria-labelledby="drawer-usage">
      <SectionLabel as="h3" id="drawer-usage">
        Today&apos;s usage · resets at midnight IST
      </SectionLabel>
      {u ? (
        <Panel elevation="flat" className="px-4.5 py-0.5">
          <KeyValueList
            layout="split"
            items={[
              { label: "AI replies", value: `${u.aiReplies} of ${AI_REPLIES_PER_DAY}` },
              { label: "AI cost", value: `${money(u.costUsd)} of ${money(USER_DAILY_SPEND_CAP_USD)}` },
              { label: "Uploads", value: `${u.uploads} of ${UPLOADS_PER_DAY}` },
              { label: "Upload size", value: `${mb(u.uploadBytes)} of ${mb(UPLOAD_BYTES_PER_DAY)}` },
              { label: "Groups made", value: `${u.groupsCreated} of ${GROUPS_CREATED_PER_DAY}` },
              { label: "Groups joined", value: `${u.groupJoins} of ${GROUP_JOINS_PER_DAY}` },
              { label: "Case studies", value: `${u.contributions} of ${CONTRIBUTIONS_PER_DAY}` },
            ]}
          />
        </Panel>
      ) : (
        <Notice tone="empty">{usage.error ? errorMessage(usage.error) : "Loading today's usage…"}</Notice>
      )}
    </section>
  );
}
