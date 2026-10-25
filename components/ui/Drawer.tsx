"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { IconButton } from "@/components/ui/IconButton";
import { Text } from "@/components/ui/Text";

type DrawerProps = {
  open: boolean;
  onClose: () => void;
  /** Mono label in the drawer header, e.g. "User". */
  label: string;
  children: ReactNode;
};

/** Right-hand sheet on the native <dialog> (admin user detail). */
export function Drawer({ open, onClose, label, children }: DrawerProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const labelId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={labelId}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className="fixed inset-y-0 right-0 left-auto m-0 h-dvh max-h-none w-full max-w-dialog-sm border-l border-ink/8 bg-linear-to-b from-paper to-callout p-0 text-ink shadow-drawer backdrop:bg-ink/24"
    >
      <div className="flex h-full flex-col">
        <div className="flex h-nav shrink-0 items-center gap-3 border-b border-ink/7 pr-4.5 pl-6">
          <Text as="h2" id={labelId} variant="badge" className="flex-1 text-muted">
            {label}
          </Text>
          <IconButton icon="close" label="Close" look="ghost" size="sm" onClick={onClose} />
        </div>
        <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-auto px-6 pt-5.5 pb-9">{children}</div>
      </div>
    </dialog>
  );
}
