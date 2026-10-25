"use client";

import { useEffect, useState } from "react";
import { duration } from "@/components/account/dates";
import { RecordKey } from "@/components/account/RecordKey";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Panel } from "@/components/ui/Panel";
import { Spinner } from "@/components/ui/Spinner";
import { Text } from "@/components/ui/Text";
import { MAX_VOICE_SECONDS } from "@/lib/limits";

type Stage = "idle" | "recording" | "transcribing" | "review";

type VoiceRecorderProps = {
  /** Transcript to review; null until one exists. */
  transcript: string | null;
  onTranscript: (text: string) => void;
};

const SAMPLE_TRANSCRIPT =
  "Fifty-eight year old woman, day four after an inferior STEMI, with new pleuritic chest pain that eases sitting forward. Friction rub on auscultation and saddle ST elevation on the ECG. Echo showed a small effusion without tamponade. Treated with high-dose aspirin and colchicine; settled over three days.";

/**
 * Talk it through: record (max MAX_VOICE_SECONDS), then review and edit the
 * transcript before submitting. Static: recording is timed only and the
 * transcript is a sample; at integration useVoiceRecorder (MediaRecorder),
 * api.contributions.audioUrl + uploadToTarget, then api.contributions.transcribe.
 */
export function VoiceRecorder({ transcript, onTranscript }: VoiceRecorderProps) {
  const [stage, setStage] = useState<Stage>(transcript === null ? "idle" : "review");
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (stage === "recording") {
      const id = setInterval(() => setSeconds((s) => Math.min(s + 1, MAX_VOICE_SECONDS)), 1000);
      return () => clearInterval(id);
    }
    if (stage === "transcribing") {
      const id = setTimeout(() => {
        onTranscript(SAMPLE_TRANSCRIPT);
        setStage("review");
      }, 1600);
      return () => clearTimeout(id);
    }
  }, [stage, onTranscript]);

  if (stage === "review" && transcript !== null) {
    return (
      <Panel size="lg" className="flex min-h-0 flex-1 flex-col gap-3.5 px-5.5 pt-4.5 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Text as="h2" variant="badge" className="text-muted">
            Transcript · edit before you submit
          </Text>
          <Button
            look="app-light-xs"
            onClick={() => {
              setSeconds(0);
              setStage("idle");
            }}
          >
            <Icon name="mic" size={14} />
            Record again
          </Button>
        </div>
        <Text
          as="textarea"
          variant="transcript"
          aria-label="Transcript"
          value={transcript}
          onChange={(event) => onTranscript(event.target.value)}
          className="min-h-40 flex-1 resize-none bg-transparent text-ink outline-none"
        />
      </Panel>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 rounded-panel-lg border border-ink/8 bg-paper px-6 py-10 text-center shadow-card">
      <Text variant="body-lg" className="max-w-120 text-muted text-pretty">
        {stage === "transcribing"
          ? "Turning your recording into text. You can edit it next."
          : "Talk through the whole case: the patient, symptoms, findings, medication and why, outcome and aftercare. Up to 10 minutes."}
      </Text>
      {stage === "transcribing" ? (
        <Text role="status" variant="body" className="flex h-26 items-center gap-2.5 text-muted">
          <Spinner />
          Transcribing…
        </Text>
      ) : (
        <RecordKey
          recording={stage === "recording"}
          onClick={() => setStage(stage === "recording" ? "transcribing" : "recording")}
        />
      )}
      <Text variant="mono-sm" className="text-muted" aria-live="polite">
        {stage === "recording"
          ? `Recording · ${duration(seconds)} / ${duration(MAX_VOICE_SECONDS)}`
          : stage === "idle"
            ? "Tap to start recording"
            : ""}
      </Text>
    </div>
  );
}
