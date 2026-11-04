"use client";

import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  /** Red confirm button for destructive actions. */
  danger?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

/** Small yes / no step before an action the user should think about. */
export function ConfirmDialog({ open, title, description, confirmLabel, danger, onCancel, onConfirm }: ConfirmDialogProps) {
  return (
    <Dialog open={open} onClose={onCancel} size="sm" title={title} description={description}>
      <div className="flex flex-wrap justify-end gap-2.5">
        <Button look="app-light-md" onClick={onCancel}>
          Cancel
        </Button>
        <Button look={danger ? "app-danger-md" : "app-accent-md"} onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </Dialog>
  );
}
