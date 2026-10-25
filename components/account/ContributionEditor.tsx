"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { TopBar } from "@/components/app/TopBar";
import { CheckingScreen } from "@/components/account/CheckingScreen";
import { SPECIALTIES } from "@/components/account/options";
import { PiiDialog } from "@/components/account/PiiDialog";
import { staticPiiCheck } from "@/components/account/staticPiiCheck";
import { VoiceRecorder } from "@/components/account/VoiceRecorder";
import { WritePanel } from "@/components/account/WritePanel";
import { Button } from "@/components/ui/Button";
import { FieldRow } from "@/components/ui/FieldRow";
import { FieldSelectRow } from "@/components/ui/FieldSelectRow";
import { Icon } from "@/components/ui/Icon";
import { Notice } from "@/components/ui/Notice";
import { Panel } from "@/components/ui/Panel";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { showToast } from "@/components/ui/toastStore";
import type { ContributionType, PiiFlag } from "@/lib/types";

export type EditorInitial = {
  title: string;
  specialty: string;
  type: ContributionType;
  text: string;
  /** Voice drafts: the transcript to review, or null before recording. */
  transcript: string | null;
  reviewNote: string | null;
};

type Stage = { kind: "editing" } | { kind: "checking" } | { kind: "flagged"; flags: PiiFlag[] };

/**
 * New case study or a draft / needs-changes edit (design "New case study").
 * Static: save and submit update local state and run a sample PII check; at integration
 * api.contributions.create / update / submit.
 */
export function ContributionEditor({ initial, isNew }: { initial: EditorInitial; isNew: boolean }) {
  const router = useRouter();
  const [title, setTitle] = useState(initial.title);
  const [specialty, setSpecialty] = useState(initial.specialty);
  const [type, setType] = useState(initial.type);
  const [text, setText] = useState(initial.text);
  const [transcript, setTranscript] = useState(initial.transcript);
  const [saved, setSaved] = useState(!isNew);
  const [stage, setStage] = useState<Stage>({ kind: "editing" });

  const body = type === "voice" ? (transcript ?? "") : text;
  const canSubmit = title.trim().length >= 3 && body.trim().length > 0;

  useEffect(() => {
    if (stage.kind !== "checking") return;
    const id = setTimeout(() => {
      const flags = staticPiiCheck(body);
      if (flags.length > 0) setStage({ kind: "flagged", flags });
      else finish();
    }, 1600);
    return () => clearTimeout(id);
  });

  function finish() {
    showToast("Submitted for review");
    router.push("/contribute?tab=review");
  }

  const edited = <T,>(set: (v: T) => void) => (value: T) => {
    set(value);
    setSaved(false);
  };

  if (stage.kind === "checking") {
    return (
      <>
        <TopBar title={title || "New case study"} subtitle="Submitting" />
        <CheckingScreen />
      </>
    );
  }

  return (
    <>
      <TopBar title={isNew ? "New case study" : title} subtitle={isNew ? "Train NeuraOS" : "Draft"} />
      <div className="flex min-h-0 flex-1 flex-col overflow-auto px-4 pt-1 pb-5 app:px-6 app:pb-7">
        <div className="mx-auto flex w-full max-w-form flex-1 flex-col gap-3.5">
          {initial.reviewNote && (
            <Notice tone="warning">
              <span className="font-medium">Reviewer:</span> {initial.reviewNote}
            </Notice>
          )}

          <Panel className="grid divide-ink/7 overflow-hidden max-sm:divide-y sm:grid-cols-[1fr_15rem] sm:divide-x">
            <FieldRow label="Title" value={title} maxLength={160} placeholder="e.g. Fast AF with heart failure" onChange={(e) => edited(setTitle)(e.target.value)} />
            <FieldSelectRow label="Specialty" value={specialty} onChange={(e) => edited(setSpecialty)(e.target.value)}>
              {SPECIALTIES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </FieldSelectRow>
          </Panel>

          {isNew && (
            <SegmentedControl<ContributionType>
              label="How do you want to add the case?"
              value={type}
              onValueChange={setType}
              className="w-full max-w-105 shrink-0"
              segments={[
                { value: "text", label: "Write it", icon: "pencil" },
                { value: "voice", label: "Talk it through", icon: "mic" },
              ]}
            />
          )}

          {type === "text" ? (
            <WritePanel text={text} saved={saved} onChange={edited(setText)} />
          ) : (
            <VoiceRecorder transcript={transcript} onTranscript={setTranscript} />
          )}

          <div className="flex shrink-0 flex-wrap justify-end gap-2.5">
            <Button
              look="app-light-lg"
              onClick={() => {
                setSaved(true);
                showToast("Draft saved");
              }}
            >
              Save draft
            </Button>
            <Button look="app-accent-lg" className="min-w-60" disabled={!canSubmit} onClick={() => setStage({ kind: "checking" })}>
              Submit case study
              <Icon name="arrow-right" size={14} />
            </Button>
          </div>
        </div>
      </div>

      <PiiDialog
        open={stage.kind === "flagged"}
        flags={stage.kind === "flagged" ? stage.flags : []}
        onEdit={() => setStage({ kind: "editing" })}
        onSubmitAnyway={finish}
      />
    </>
  );
}
