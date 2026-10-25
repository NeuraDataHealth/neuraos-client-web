import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Text } from "@/components/ui/Text";

/** Shown for a failed reply, or one stuck streaming past STALE_STREAM_SECONDS. */
export function AiErrorNotice({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-callout border border-danger/30 bg-danger/7 py-3 pr-3 pl-4">
      <span className="text-danger-text">
        <Icon name="warning" size={16} />
      </span>
      <Text variant="body" className="min-w-40 flex-1 text-ink-soft">
        NeuraOS couldn&apos;t finish this answer.
      </Text>
      <Button look="app-light-sm" onClick={onRetry}>
        <Icon name="refresh" size={14} />
        Retry
      </Button>
    </div>
  );
}
