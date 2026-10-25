"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { ZoomControl } from "@/components/admin/ZoomControl";
import { Icon } from "@/components/ui/Icon";
import { Text } from "@/components/ui/Text";

type DocumentLightboxProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle: string;
  children: ReactNode;
};

/** Full-screen dark viewer for a verification document, on the native <dialog>. */
export function DocumentLightbox({ open, onClose, title, subtitle, children }: DocumentLightboxProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [zoom, setZoom] = useState(2);

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
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      className="m-0 h-dvh max-h-none w-full max-w-none bg-ink/88 p-0 text-on-dark backdrop:bg-transparent"
    >
      <div className="flex h-full flex-col">
        <div className="flex h-17 shrink-0 items-center gap-3 pr-5 pl-6">
          <div className="min-w-0 flex-1">
            <Text as="h2" id={titleId} variant="item-title">
              {title}
            </Text>
            <Text variant="mono-meta" className="mt-0.75 text-on-dark-muted">
              {subtitle}
            </Text>
          </div>
          <ZoomControl zoom={zoom} onZoom={setZoom} min={1} max={4} tone="dark" />
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="flex size-10 cursor-pointer items-center justify-center rounded-full bg-paper/8 text-paper hover:bg-paper/16"
          >
            <Icon name="close" size={12} />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-auto px-6 pt-6 pb-12">
          <div className="mx-auto w-fit" style={{ zoom }}>
            {children}
          </div>
        </div>
      </div>
    </dialog>
  );
}
