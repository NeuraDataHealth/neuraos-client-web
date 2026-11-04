"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import type { ComposerDraft } from "@/components/chat/Composer";
import { Composer } from "@/components/chat/Composer";
import { showToast } from "@/components/ui/toastStore";
import { useChat } from "@/hooks/chat/useChat";
import { useChats } from "@/hooks/chat/useChats";
import { useAuth } from "@/hooks/useAuth";
import { api, errorMessage } from "@/lib/api/client";
import { uiPreview } from "@/lib/firebase/preview";
import { MAX_UPLOADS_PER_USER_PER_CHAT } from "@/lib/limits";

const TITLE_CHARS = 60;

/** A chat title from the first words of the message, or from a file name. */
function titleFrom(text: string): string {
  const clean = text.replace(/\s+/g, " ").trim();
  return (clean.length > TITLE_CHARS ? `${clean.slice(0, TITLE_CHARS).trimEnd()}…` : clean) || "New chat";
}

/**
 * New-chat composer. The chat is created by the first attachment (so the upload
 * has a chat to go to) or by the first message, then the message is sent and the
 * chat opens. Its AI answer streams in through the chat's Firestore listener.
 */
export function HomeComposer() {
  const router = useRouter();
  const { user } = useAuth();
  const { createChat } = useChats();
  const [busy, setBusy] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);
  const creating = useRef<Promise<string> | null>(null);
  const { chat } = useChat(chatId);

  function ensureChat(title: string): Promise<string> {
    creating.current ??= createChat(titleFrom(title)).then(
      ({ chatId: id }) => {
        setChatId(id);
        return id;
      },
      (error: unknown) => {
        creating.current = null;
        throw error;
      },
    );
    return creating.current;
  }

  async function handleSend(draft: ComposerDraft) {
    if (uiPreview) return router.push("/chat/chat_new");

    setBusy(true);
    try {
      const id = await ensureChat(draft.text);
      // Open the chat as soon as the message is written; the answer keeps streaming there.
      const sent = api.messages.send(id, {
        text: draft.text,
        mentions: draft.mentions,
        replyToMsgId: null,
        attachmentIds: draft.attachmentIds,
      });
      sent.catch((error: unknown) => showToast(errorMessage(error)));
      router.push(`/chat/${id}`);
    } catch (error) {
      showToast(errorMessage(error));
      setBusy(false);
    }
  }

  const used = (user && chat?.uploadCounts?.[user.uid]) ?? 0;

  return (
    <Composer
      placeholder="Describe a case…"
      members={[]}
      mentionsEnabled={false}
      replyTo={null}
      busy={busy}
      uploadsRemaining={MAX_UPLOADS_PER_USER_PER_CHAT - used}
      uploadTarget={ensureChat}
      onSend={handleSend}
    />
  );
}
