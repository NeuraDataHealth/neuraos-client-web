import { Text } from "@/components/ui/Text";

/** Mock government ID (fictional, number masked), as drawn in the design. 250×158. */
export function IdCardPreview({ name }: { name: string }) {
  return (
    <div className="flex h-39.5 w-62.5 flex-col gap-2.5 rounded-card bg-linear-to-b from-paper to-field px-3.5 py-3 text-ink shadow-card-raised">
      <Text as="span" variant="doc-kicker" className="flex justify-between text-copy">
        <span>Identity card</span>
        <span>Govt. issued</span>
      </Text>
      <span className="flex flex-1 gap-3">
        <span aria-hidden="true" className="w-14.5 rounded-check bg-placeholder" />
        <span className="flex flex-1 flex-col gap-0.75 text-muted">
          <Text as="span" variant="doc-label">
            Name
          </Text>
          <Text as="span" variant="doc-name" className="text-ink">
            {name.replace(/^Dr\.?\s*/i, "")}
          </Text>
          <Text as="span" variant="doc-label" className="mt-1">
            Date of birth
          </Text>
          <Text as="span" variant="doc-value" className="text-ink">
            ●● / ●● / 19●●
          </Text>
        </span>
      </span>
      <Text as="span" variant="doc-id" className="text-ink-soft">
        XXXX XXXX 0000
      </Text>
    </div>
  );
}
