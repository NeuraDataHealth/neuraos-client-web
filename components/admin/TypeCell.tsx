import { Icon } from "@/components/ui/Icon";
import { Text } from "@/components/ui/Text";
import type { ContributionType } from "@/lib/types";

/** Text / Voice with its icon. */
export function TypeCell({ type }: { type: ContributionType }) {
  return (
    <Text as="span" variant="body-sm" className="flex items-center gap-1.75 text-ink-soft">
      <span className="text-muted">
        <Icon name={type === "voice" ? "mic" : "text"} size={15} />
      </span>
      {type === "voice" ? "Voice" : "Text"}
    </Text>
  );
}
