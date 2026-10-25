import NextLink from "next/link";
import { TopBar } from "@/components/app/TopBar";
import { dateTime, duration } from "@/components/account/dates";
import { PiiText } from "@/components/account/PiiText";
import { contributionPill } from "@/components/account/statusPills";
import { Icon } from "@/components/ui/Icon";
import { keyClassName, keyTextVariant } from "@/components/ui/keyStyles";
import { LogoMark } from "@/components/ui/LogoMark";
import { Notice } from "@/components/ui/Notice";
import { Panel } from "@/components/ui/Panel";
import { StatusPill } from "@/components/ui/StatusPill";
import { Text } from "@/components/ui/Text";
import type { ContributionDoc } from "@/lib/types";

/** Submitted, approved or rejected case study, read-only (design "Case study" detail). */
export function ContributionView({ contribution: c }: { contribution: ContributionDoc }) {
  const pill = contributionPill[c.status];
  const when = c.reviewedAt ?? c.submittedAt ?? c.createdAt;
  const flags = c.piiCheck?.flags ?? [];

  return (
    <>
      <TopBar title={c.title} subtitle={pill.label} />
      <div className="min-h-0 flex-1 overflow-auto px-4 pt-2 pb-12 app:px-6">
        <article className="mx-auto flex max-w-form flex-col gap-3.5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Text variant="mono-sm" className="flex items-center gap-2 text-muted">
              <LogoMark className="size-4.5 text-ink" />
              {c.specialty} · {c.type === "voice" ? "Voice" : "Text"} · {dateTime(when)}
            </Text>
            <StatusPill tone={pill.tone}>{pill.label}</StatusPill>
          </div>
          <Text as="h2" variant="app-title" className="text-balance">
            {c.title}
          </Text>

          {c.reviewNote && (
            <div className="mt-1.5">
              <Notice tone={c.status === "rejected" ? "info" : "warning"}>
                <span className="font-medium">Reviewer:</span> {c.reviewNote}
              </Notice>
            </div>
          )}

          {c.audio && (
            <Text variant="mono-sm" className="flex items-center gap-2 text-muted">
              <Icon name="mic" size={14} />
              Voice note · {duration(c.audio.durationSec)} · the confirmed transcript is below
            </Text>
          )}

          <Panel className="mt-1.5 px-6 py-5.5">
            <PiiText text={c.text} flags={flags} />
          </Panel>

          {flags.length > 0 && (
            <Text variant="caption" className="text-muted">
              Highlighted text was flagged as possible patient details. The reviewer sees the same flags.
            </Text>
          )}

          <div className="mt-1.5 flex flex-wrap items-center justify-between gap-3">
            <Text variant="caption" className="text-muted">
              {c.status === "submitted" ? "NeuraOS reviews every case before it is used for training." : `Reviewed ${dateTime(when)}`}
            </Text>
            <Text
              as={NextLink}
              href="/contribute"
              variant={keyTextVariant("app-accent-lg")}
              className={keyClassName("app-accent-lg", "min-w-30")}
            >
              Done
            </Text>
          </div>
        </article>
      </div>
    </>
  );
}
