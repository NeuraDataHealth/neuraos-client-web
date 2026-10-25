"use client";

import type { Decision } from "@/components/admin/DecisionPanel";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import type { KeyLook } from "@/components/ui/keyStyles";
import { Text } from "@/components/ui/Text";

type ConfirmDecisionDialogProps = {
  open: boolean;
  kind: "application" | "contribution";
  decision: Decision;
  subject: string;
  person: string;
  note: string;
  onCancel: () => void;
  onConfirm: () => void;
};

const look: Record<Decision, KeyLook> = {
  approved: "app-accent-md",
  rejected: "app-danger-md",
  needs_info: "app-dark-md",
  needs_changes: "app-dark-md",
};

function copy(kind: ConfirmDecisionDialogProps["kind"], decision: Decision, subject: string, person: string) {
  if (kind === "application") {
    return {
      approved: [`Approve ${subject}?`, "They'll be verified and can contribute case studies. We'll email them.", "Approve"],
      rejected: [`Reject ${subject}'s application?`, "They can't contribute with this account. We'll email them your note.", "Reject"],
      needs_info: [`Ask ${subject} for more info?`, "The application moves to Needs info. We'll email them your note.", "Send request"],
      needs_changes: ["", "", ""],
    }[decision];
  }
  return {
    approved: [`Approve ${subject}?`, `It joins NeuraOS training data. ${person} gets notified.`, "Approve"],
    rejected: [`Reject ${subject}?`, `It won't be used for training. ${person} gets your note.`, "Reject"],
    needs_changes: [`Request changes to ${subject}?`, `${person} can edit and resubmit. They'll get your note.`, "Send request"],
    needs_info: ["", "", ""],
  }[decision];
}

/** Last step before a decision is recorded (the audit log entry is written with it). */
export function ConfirmDecisionDialog({ open, kind, decision, subject, person, note, onCancel, onConfirm }: ConfirmDecisionDialogProps) {
  const [title, description, action] = copy(kind, decision, subject, person);
  return (
    <Dialog open={open} onClose={onCancel} size="sm" title={title} description={description}>
      <div className="flex flex-col gap-5">
        {note && (
          <div className="flex flex-col gap-1.5 rounded-tile border border-ink/6 bg-callout px-3.5 py-3">
            <Text as="span" variant="key-label" className="text-muted">
              Your note
            </Text>
            <Text variant="body" className="text-ink-soft text-pretty">
              {note}
            </Text>
          </div>
        )}
        <div className="flex flex-wrap justify-end gap-2.5">
          <Button look="app-light-md" onClick={onCancel}>
            Cancel
          </Button>
          <Button look={look[decision]} onClick={onConfirm}>
            {action}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
