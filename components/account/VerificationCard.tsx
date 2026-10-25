import NextLink from "next/link";
import { verificationPill } from "@/components/account/statusPills";
import { keyClassName, keyTextVariant } from "@/components/ui/keyStyles";
import { Panel } from "@/components/ui/Panel";
import { StatusPill } from "@/components/ui/StatusPill";
import { Text } from "@/components/ui/Text";
import type { VerificationStatus } from "@/lib/types";

const copy: Record<VerificationStatus, { text: string; action: string }> = {
  none: { text: "Verified doctors can contribute case studies that train NeuraOS.", action: "Get verified" },
  pending: { text: "We're checking your registration with the medical council.", action: "View application" },
  needs_info: { text: "The reviewer needs something from you before they can decide.", action: "Update application" },
  approved: { text: "You can contribute case studies that train NeuraOS.", action: "View verification" },
  rejected: { text: "Your application wasn't approved. See the reviewer's note.", action: "View application" },
};

/** Verification status on the profile, linking to /verify. */
export function VerificationCard({ status }: { status: VerificationStatus }) {
  const pill = verificationPill[status];
  return (
    <Panel className="flex flex-col gap-4 p-5">
      <div className="flex items-center justify-between gap-3">
        <Text as="h3" variant="item-title">
          Doctor verification
        </Text>
        <StatusPill tone={pill.tone}>{pill.label}</StatusPill>
      </div>
      <Text variant="body" className="text-muted text-pretty">
        {copy[status].text}
      </Text>
      <Text
        as={NextLink}
        href="/verify"
        variant={keyTextVariant("app-light-sm")}
        className={keyClassName("app-light-sm", "self-start")}
      >
        {copy[status].action}
      </Text>
    </Panel>
  );
}
