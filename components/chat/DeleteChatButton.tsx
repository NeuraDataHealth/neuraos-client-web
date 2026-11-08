"use client";

import { useState } from "react";
import { IconButton } from "@/components/ui/IconButton";
import { showToast } from "@/components/ui/toastStore";
import { useConfirm } from "@/components/ui/useConfirm";
import { errorMessage } from "@/lib/api/client";

type DeleteChatButtonProps = {
  isGroup: boolean;
  title: string;
  /** DELETE /api/chats/:id, then leave the page. */
  onDelete: () => Promise<void>;
};

/** Owner's delete key in the chat top bar, with a confirm (a group goes for every member). */
export function DeleteChatButton({ isGroup, title, onDelete }: DeleteChatButtonProps) {
  const confirm = useConfirm();
  const [busy, setBusy] = useState(false);
  const noun = isGroup ? "group" : "chat";

  async function remove() {
    const ok = await confirm.ask({
      title: `Delete this ${noun}?`,
      description: isGroup
        ? `"${title}" will be deleted for every member, with its messages and files. This can't be undone.`
        : `"${title}" will be deleted with its messages and files. This can't be undone.`,
      confirmLabel: `Delete ${noun}`,
      danger: true,
    });
    if (!ok) return;
    setBusy(true);
    try {
      await onDelete();
      showToast(isGroup ? "Group deleted" : "Chat deleted");
    } catch (error) {
      showToast(errorMessage(error));
      setBusy(false);
    }
  }

  return (
    <>
      {confirm.dialog}
      <IconButton
        icon="trash"
        label={`Delete ${noun}`}
        look="ghost"
        size="md"
        aria-disabled={busy}
        onClick={() => {
          if (!busy) void remove();
        }}
      />
    </>
  );
}
