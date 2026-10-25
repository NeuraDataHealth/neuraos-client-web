import { IconButton } from "@/components/ui/IconButton";
import { Icon } from "@/components/ui/Icon";
import { Text } from "@/components/ui/Text";
import type { ReplyTo } from "@/lib/types";

/** "Replying to …" card above the composer. */
export function ReplyStrip({ reply, onCancel }: { reply: ReplyTo; onCancel: () => void }) {
  return (
    <div className="flex items-center gap-3 rounded-callout border border-ink/8 bg-paper py-2 pr-2 pl-4 shadow-card-sm">
      <span className="text-accent">
        <Icon name="reply" size={15} />
      </span>
      <div className="min-w-0 flex-1 border-l-2 border-accent/50 pl-2.5">
        <Text variant="ui-xs">Replying to {reply.senderName}</Text>
        <Text variant="meta-md" className="mt-0.5 truncate text-muted">
          {reply.snippet}
        </Text>
      </div>
      <IconButton icon="close" label="Cancel reply" look="ghost" size="sm" onClick={onCancel} />
    </div>
  );
}
