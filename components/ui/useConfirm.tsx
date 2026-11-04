"use client";

import { useRef, useState } from "react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

type Prompt = { title: string; description: string; confirmLabel: string; danger?: boolean };

/**
 * Asks before an action and waits for the answer: `await confirm.ask({...})` resolves
 * true or false. Render `confirm.dialog` once in the component.
 */
export function useConfirm() {
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [open, setOpen] = useState(false);
  const resolve = useRef<((ok: boolean) => void) | null>(null);

  function ask(next: Prompt): Promise<boolean> {
    resolve.current?.(false);
    setPrompt(next);
    setOpen(true);
    return new Promise((done) => {
      resolve.current = done;
    });
  }

  function settle(ok: boolean) {
    resolve.current?.(ok);
    resolve.current = null;
    setOpen(false);
  }

  const dialog = prompt && (
    <ConfirmDialog
      open={open}
      title={prompt.title}
      description={prompt.description}
      confirmLabel={prompt.confirmLabel}
      danger={prompt.danger}
      onCancel={() => settle(false)}
      onConfirm={() => settle(true)}
    />
  );

  return { ask, dialog };
}
