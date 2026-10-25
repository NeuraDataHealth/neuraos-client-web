import { ButtonLink } from "@/components/ui/ButtonLink";
import { Text } from "@/components/ui/Text";

/** The guardrail's emergency reply: 108 / 112 as tap-to-call keys. */
export function EmergencyNotice({ text }: { text: string }) {
  return (
    <div role="alert" className="flex flex-col gap-3.5 rounded-callout border border-danger/30 bg-danger/7 p-4">
      <div>
        <Text as="p" variant="item-title" className="text-danger-text">
          This may be an emergency
        </Text>
        <Text variant="body" className="mt-1 text-ink-soft text-pretty">
          {text}
        </Text>
      </div>
      <div className="flex flex-wrap gap-2.5">
        <ButtonLink href="tel:108" look="app-danger-md">
          Call 108 · Ambulance
        </ButtonLink>
        <ButtonLink href="tel:112" look="app-light-md">
          Call 112 · Emergency
        </ButtonLink>
      </div>
    </div>
  );
}
