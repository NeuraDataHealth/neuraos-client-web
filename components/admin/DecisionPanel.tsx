"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import type { KeyLook } from "@/components/ui/keyStyles";
import { Panel } from "@/components/ui/Panel";
import { RadioCard } from "@/components/ui/RadioCard";
import { Text } from "@/components/ui/Text";
import { TextArea } from "@/components/ui/TextArea";
import { ConfirmDecisionDialog } from "@/components/admin/ConfirmDecisionDialog";

export type Decision = "approved" | "rejected" | "needs_info" | "needs_changes";

type DecisionPanelProps = {
  kind: "application" | "contribution";
  /** Applicant name or case code, for the confirm step. */
  subject: string;
  /** Contributor name (contributions), for the confirm step. */
  person: string;
  onDecide: (decision: Decision, note: string | null) => void;
};

const options = {
  application: [
    { value: "approved", title: "Approve", description: "Verify them and give full access." },
    { value: "rejected", title: "Reject", description: "They can't use NeuraOS with this account." },
    { value: "needs_info", title: "Request more info", description: "Ask for a document or detail." },
  ],
  contribution: [
    { value: "approved", title: "Approve", description: "Add it to NeuraOS training data." },
    { value: "rejected", title: "Reject", description: "It won't be used for training." },
    { value: "needs_changes", title: "Request changes", description: "They edit it and resubmit." },
  ],
} satisfies Record<string, { value: Decision; title: string; description: string }[]>;

const look: Record<Decision, KeyLook> = {
  approved: "app-accent-lg",
  rejected: "app-danger-lg",
  needs_info: "app-dark-lg",
  needs_changes: "app-dark-lg",
};

const placeholder: Record<Decision, string> = {
  approved: "Optional. They'll see this.",
  rejected: "Explain why. They'll see this.",
  needs_info: "What should they send?",
  needs_changes: "What should they change?",
};

/** Decision card (design): options, a note (required unless approving, as the API requires), then a confirm step. */
export function DecisionPanel({ kind, subject, person, onDecide }: DecisionPanelProps) {
  const [decision, setDecision] = useState<Decision>("approved");
  const [note, setNote] = useState("");
  const [confirming, setConfirming] = useState(false);
  const needsNote = decision !== "approved" && !note.trim();
  const noun = kind === "application" ? "application" : "contribution";
  const label = {
    approved: `Approve ${noun}`,
    rejected: `Reject ${noun}`,
    needs_info: "Request more info",
    needs_changes: "Request changes",
  }[decision];

  return (
    <Panel size="lg" className="flex flex-col gap-4 p-5">
      <Text as="h2" variant="badge" className="text-muted">
        Decision
      </Text>
      <fieldset className="flex flex-col gap-2">
        <legend className="sr-only">Decision</legend>
        {options[kind].map((o) => (
          <RadioCard
            key={o.value}
            name={`decision-${kind}`}
            title={o.title}
            description={o.description}
            checked={decision === o.value}
            onChange={() => setDecision(o.value)}
          />
        ))}
      </fieldset>
      <label className="flex flex-col gap-2">
        <span className="flex justify-between gap-2.5 px-1">
          <Text as="span" variant="key-label" className="text-muted">
            Note to {kind === "application" ? "applicant" : "contributor"}
          </Text>
          <Text as="span" variant="mono-meta" className={decision === "approved" ? "text-faint" : "text-amber-text"}>
            {decision === "approved" ? "Optional" : "Required"}
          </Text>
        </span>
        <TextArea rows={4} maxLength={1000} value={note} placeholder={placeholder[decision]} onChange={(e) => setNote(e.target.value)} />
      </label>
      <Button look={look[decision]} disabled={needsNote} onClick={() => setConfirming(true)}>
        {label}
      </Button>
      <ConfirmDecisionDialog
        open={confirming}
        kind={kind}
        decision={decision}
        subject={subject}
        person={person}
        note={note.trim()}
        onCancel={() => setConfirming(false)}
        onConfirm={() => {
          setConfirming(false);
          onDecide(decision, note.trim() || null);
        }}
      />
    </Panel>
  );
}
