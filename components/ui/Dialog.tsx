"use client";

import { clsx } from "clsx";
import { useEffect, useId, useRef, type ReactNode } from "react";
import { IconButton } from "@/components/ui/IconButton";
import { Text } from "@/components/ui/Text";

type DialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: ReactNode;
  /** Small accent badge beside the title, e.g. "2 of 3". */
  badge?: string;
  /** `md` 480px (groups), `sm` 460px (confirmations). */
  size?: "md" | "sm";
  children: ReactNode;
};

/**
 * Modal on the native <dialog>: focus trap, Esc and backdrop click close it,
 * focus returns to the opener. Blurred ink scrim as designed.
 */
export function Dialog({ open, onClose, title, description, badge, size = "md", children }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className={clsx(
        "m-auto max-h-[calc(100dvh-3rem)] w-[calc(100%-3rem)] overflow-auto rounded-dialog border border-ink/8 bg-paper p-6 text-ink shadow-dialog backdrop:bg-ink/32 backdrop:backdrop-blur-[3px]",
        size === "md" ? "max-w-dialog" : "max-w-dialog-sm",
      )}
    >
      <div className="flex flex-col gap-5">
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <Text as="h2" id={titleId} variant="dialog-title" className="text-balance">
              {title}
            </Text>
            {description && (
              <Text as="div" id={descriptionId} variant="body" className="mt-1.5 text-muted text-pretty">
                {description}
              </Text>
            )}
          </div>
          {badge && (
            <Text
              as="span"
              variant="mono-sm"
              className="mt-0.5 inline-flex h-6.5 shrink-0 items-center rounded-full border border-accent/28 bg-accent/8 px-2.5 whitespace-nowrap text-accent"
            >
              {badge}
            </Text>
          )}
          <IconButton icon="close" label="Close" look="ghost" size="sm" className="-mt-0.75 -mr-1.5" onClick={onClose} />
        </div>
        {children}
      </div>
    </dialog>
  );
}
