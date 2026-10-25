import NextLink from "next/link";
import { EmptyState } from "@/components/ui/EmptyState";
import { keyClassName, keyTextVariant } from "@/components/ui/keyStyles";
import { Text } from "@/components/ui/Text";

/** Why case studies are unavailable: not verified yet, or contributions switched off. */
export function ContributeGate({ reason }: { reason: "unverified" | "paused" }) {
  if (reason === "paused") {
    return (
      <EmptyState
        icon="contributions"
        title="Contributions are paused"
        description="We're not taking new case studies right now. Your drafts are safe; check back soon."
      />
    );
  }
  return (
    <EmptyState
      icon="lock"
      title="Get verified to contribute"
      description="Case studies come from verified doctors. Verification takes a registration certificate and an ID proof."
    >
      <Text
        as={NextLink}
        href="/verify"
        variant={keyTextVariant("app-accent-md")}
        className={keyClassName("app-accent-md", "mt-3")}
      >
        Get verified
      </Text>
    </EmptyState>
  );
}
