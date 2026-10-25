import { Text } from "@/components/ui/Text";

/** Centred note for joins, leaves, removals, file deletions and conversions. */
export function SystemMessage({ text }: { text: string }) {
  return (
    <li className="flex justify-center">
      <Text
        as="p"
        variant="mono-sm"
        className="flex min-h-7 max-w-full items-center rounded-card bg-ink/4 px-3 py-1.25 text-center text-muted"
      >
        {text}
      </Text>
    </li>
  );
}
