"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { TextArea } from "@/components/ui/TextArea";

type FeedbackDialogProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (reason: string | null) => void;
};

/** Optional reason after a thumbs down. */
export function FeedbackDialog({ open, onClose, onSubmit }: FeedbackDialogProps) {
  const [reason, setReason] = useState("");
  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="sm"
      title="What was wrong with this answer?"
      description="Optional. It helps us improve NeuraOS. Don't include patient names or identifiers."
    >
      <form
        className="flex flex-col gap-5"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit(reason.trim() || null);
          setReason("");
        }}
      >
        <TextArea
          aria-label="Reason"
          value={reason}
          maxLength={500}
          rows={4}
          placeholder="For example: outdated guidance, missed a contraindication…"
          onChange={(event) => setReason(event.target.value)}
        />
        <div className="flex flex-wrap justify-end gap-2.5">
          <Button look="app-light-md" onClick={onClose}>
            Cancel
          </Button>
          <Button look="app-accent-md" type="submit">
            Send feedback
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
