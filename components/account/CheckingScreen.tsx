import { HexBadgeLoader } from "@/components/scene/HexBadgeLoader";
import { Text } from "@/components/ui/Text";

/** Shown while the PII check runs on submit (the design's "Structuring" screen). */
export function CheckingScreen() {
  return (
    <div role="status" className="flex min-h-0 flex-1 flex-col items-center justify-center gap-2.5 px-6 pb-18 text-center">
      <div className="relative h-55 w-70">
        <HexBadgeLoader fill={0.72} />
      </div>
      <Text as="p" variant="status-title">
        Checking for patient details
      </Text>
      <Text variant="body-lg" className="max-w-105 text-muted text-pretty">
        NeuraOS looks for names, phone numbers, ID numbers and addresses before your case goes to review.
      </Text>
    </div>
  );
}
