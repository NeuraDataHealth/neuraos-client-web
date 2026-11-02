"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ComposerDraft } from "@/components/chat/Composer";
import { Composer } from "@/components/chat/Composer";
import { showToast } from "@/components/ui/toastStore";
import { useChats } from "@/hooks/chat/useChats";
import { api, ApiError } from "@/lib/api/client";
import { uiPreview } from "@/lib/firebase/preview";
import { MAX_UPLOADS_PER_USER_PER_CHAT } from "@/lib/limits";

/**
 * New-chat composer: creates the chat (api.chats.create), sends the message,
 * then opens the chat.
 */
export function HomeComposer() {
  const router = useRouter();
  const { createChat } = useChats();
  const [busy, setBusy] = useState(false);

  async function handleSend(draft: ComposerDraft) {
    if (uiPreview) {
      router.push("/chat/chat_new");
      return;
    }

    setBusy(true);
    try {
      const title = draft.text.slice(0, 40).trim() || "New chat";
      const { chatId } = await createChat(title);

      // Send the first message (this also triggers the AI reply in a solo chat)
      await api.messages.send(chatId, {
        text: draft.text,
        mentions: draft.mentions,
        replyToMsgId: null,
        attachmentIds: [],
      });

      router.push(`/chat/${chatId}`);
    } catch (err) {
      if (err instanceof ApiError) {
        showToast(err.message);
      } else {
        showToast("Failed to create chat. Please try again.");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <Composer
      placeholder="Describe a case…"
      members={[]}
      mentionsEnabled={false}
      replyTo={null}
      busy={busy}
      uploadsRemaining={MAX_UPLOADS_PER_USER_PER_CHAT}
      onSend={handleSend}
    />
  );
}
