import { Panel } from "@/components/ui/Panel";
import { Text } from "@/components/ui/Text";
import { Timeline, type TimelineEntry } from "@/components/ui/Timeline";

/** Review history card in the right column. */
export function HistoryPanel({ entries }: { entries: TimelineEntry[] }) {
  return (
    <Panel size="lg" className="flex flex-col gap-3.5 p-5">
      <Text as="h2" variant="badge" className="text-muted">
        History
      </Text>
      <Timeline entries={entries} />
    </Panel>
  );
}
