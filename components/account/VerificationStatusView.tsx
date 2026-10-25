import NextLink from "next/link";
import { dateTime } from "@/components/account/dates";
import { verificationPill } from "@/components/account/statusPills";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { keyClassName, keyTextVariant } from "@/components/ui/keyStyles";
import { KeyValueList } from "@/components/ui/KeyValueList";
import { LogoMark } from "@/components/ui/LogoMark";
import { Notice } from "@/components/ui/Notice";
import { Panel } from "@/components/ui/Panel";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { StatusPill } from "@/components/ui/StatusPill";
import { Text } from "@/components/ui/Text";
import { Timeline, type TimelineEntry } from "@/components/ui/Timeline";
import type { VerificationApplicationDoc } from "@/lib/types";

type VerificationStatusViewProps = {
  application: VerificationApplicationDoc;
  onUpdate: () => void;
};

/** Where an application stands: pending, needs info (resubmit), approved or rejected. */
export function VerificationStatusView({ application: a, onUpdate }: VerificationStatusViewProps) {
  const pill = verificationPill[a.status];
  const history: TimelineEntry[] = [
    { id: "submitted", title: "Application submitted", meta: dateTime(a.submittedAt), tone: "accent" },
    a.reviewedAt
      ? {
          id: "reviewed",
          title: a.status === "approved" ? "Approved" : a.status === "rejected" ? "Not approved" : "More information requested",
          meta: dateTime(a.reviewedAt),
          note: a.reviewNote ?? undefined,
          tone: a.status === "approved" ? "ink" : a.status === "rejected" ? "red" : "amber",
        }
      : { id: "review", title: "Checking your registration", meta: "Usually within a day", tone: "grey" },
  ];

  return (
    <div className="flex flex-col gap-7">
      <Panel size="lg" className="flex flex-wrap items-center gap-4 p-5.5">
        {a.status === "approved" ? (
          <span className="flex size-15 shrink-0 items-center justify-center rounded-full bg-linear-to-b from-accent-hi to-accent shadow-key-accent-sm">
            <LogoMark className="size-7 text-paper" />
          </span>
        ) : (
          <span className="flex size-15 shrink-0 items-center justify-center rounded-full bg-field text-copy">
            <Icon name="applications" size={26} />
          </span>
        )}
        <div className="min-w-50 flex-1">
          <Text as="h2" variant="profile-name">
            {a.status === "approved" ? "You're a verified doctor" : a.fullName}
          </Text>
          <Text variant="body" className="mt-1.5 text-muted">
            {a.specialty} · {a.councilName}
          </Text>
        </div>
        <StatusPill tone={pill.tone} size="md">
          {pill.label}
        </StatusPill>
      </Panel>

      {a.status === "needs_info" && a.reviewNote && (
        <Notice tone="warning">
          <span className="font-medium">The reviewer asked:</span> {a.reviewNote}
        </Notice>
      )}
      {a.status === "rejected" && a.reviewNote && (
        <div className="rounded-callout border border-danger/30 bg-danger/7 px-4 py-3.5">
          <Text variant="body" className="text-ink-soft">
            <span className="font-medium text-danger-text">Not approved:</span> {a.reviewNote}
          </Text>
        </div>
      )}

      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,20rem),1fr))] items-start gap-7">
        <section aria-labelledby="application-history">
          <SectionLabel id="application-history">History</SectionLabel>
          <Panel className="px-4.5 pt-4 pb-0.5">
            <Timeline entries={history} />
          </Panel>
        </section>
        <section aria-labelledby="application-details">
          <SectionLabel id="application-details">Application</SectionLabel>
          <Panel className="px-5 py-1">
            <KeyValueList
              layout="split"
              items={[
                { label: "Registration no.", value: a.registrationNumber },
                { label: "Year", value: String(a.registrationYear) },
                { label: "Hospital / clinic", value: a.institution },
                { label: "Documents", value: `${a.documents.length} uploaded` },
              ]}
            />
          </Panel>
        </section>
      </div>

      <div className="flex flex-wrap justify-end gap-2.5">
        {a.status === "needs_info" && (
          <Button look="app-accent-lg" onClick={onUpdate}>
            Update application
          </Button>
        )}
        {a.status === "approved" && (
          <Text
            as={NextLink}
            href="/contribute/new"
            variant={keyTextVariant("app-accent-lg")}
            className={keyClassName("app-accent-lg")}
          >
            Start contributing
            <Icon name="arrow-right" size={14} />
          </Text>
        )}
      </div>
    </div>
  );
}
