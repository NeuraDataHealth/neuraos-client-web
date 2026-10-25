import { Icon } from "@/components/ui/Icon";
import { Text } from "@/components/ui/Text";

/** The guardrail's decline for non-medical or unsafe requests. */
export function DeclinedNotice({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2.5 rounded-callout border border-ink/7 bg-callout px-4 py-3.5">
      <span className="mt-0.5 text-muted">
        <Icon name="chat" size={16} />
      </span>
      <Text variant="body" className="text-ink-soft text-pretty">
        {text}
      </Text>
    </div>
  );
}
