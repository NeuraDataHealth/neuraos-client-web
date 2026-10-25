import { Icon } from "@/components/ui/Icon";
import { Text } from "@/components/ui/Text";

/** Small "Reply" action under a message; shown on hover, focus and touch screens. */
export function ReplyButton({ onClick, name }: { onClick: () => void; name: string }) {
  return (
    <Text
      as="button"
      type="button"
      variant="ui-xs"
      onClick={onClick}
      aria-label={`Reply to ${name}`}
      className="inline-flex h-7 cursor-pointer items-center gap-1.5 rounded-full px-2.5 text-muted opacity-0 transition-opacity duration-(--duration-row) group-focus-within:opacity-100 group-hover:opacity-100 hover:bg-ink/4 hover:text-ink focus-visible:opacity-100 pointer-coarse:opacity-100"
    >
      <Icon name="reply" size={13} />
      Reply
    </Text>
  );
}
