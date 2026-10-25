import { isoDayTime, statusPill } from "@/components/admin/adminLabels";
import { Panel } from "@/components/ui/Panel";
import { StatusPill } from "@/components/ui/StatusPill";
import { Text } from "@/components/ui/Text";

type DecidedPanelProps = {
  status: string;
  reviewer: string;
  reviewedAt: string | null;
  note: string | null;
};

/** Decision card once a decision exists: pill, who and when, the note. */
export function DecidedPanel({ status, reviewer, reviewedAt, note }: DecidedPanelProps) {
  const pill = statusPill(status);
  return (
    <Panel size="lg" className="flex flex-col gap-4 p-5">
      <Text as="h2" variant="badge" className="text-muted">
        Decision
      </Text>
      <div className="flex flex-wrap items-center gap-2.5">
        <StatusPill tone={pill.tone} size="md">
          {pill.label}
        </StatusPill>
        <Text as="span" variant="caption" className="text-muted">
          {reviewer}
          {reviewedAt ? ` · ${isoDayTime(reviewedAt)}` : ""}
        </Text>
      </div>
      {note && (
        <Text variant="body" className="rounded-card border border-ink/6 bg-callout px-3.5 py-3 text-ink-soft text-pretty">
          {note}
        </Text>
      )}
    </Panel>
  );
}
