import { LogoMark } from "@/components/ui/LogoMark";
import { Text } from "@/components/ui/Text";

/** A chat with no messages yet. */
export function ChatEmpty({ isGroup }: { isGroup: boolean }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
      <LogoMark className="size-10 text-ink" />
      <Text as="p" variant="empty-title">
        {isGroup ? "Start the discussion" : "Describe the case"}
      </Text>
      <Text variant="body" className="max-w-90 text-muted text-pretty">
        {isGroup
          ? "Everyone here sees new messages. Type @AI when you want NeuraOS to answer."
          : "Add age, history, findings and what you want to know. Attach a report if you have one."}
      </Text>
    </div>
  );
}
