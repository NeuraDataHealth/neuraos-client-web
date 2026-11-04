"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import type { ComposerDraft } from "@/components/chat/Composer";
import { Composer } from "@/components/chat/Composer";
import { showToast } from "@/components/ui/toastStore";
import { useConfirm } from "@/components/ui/useConfirm";
import { useChat } from "@/hooks/chat/useChat";
import { useChats } from "@/hooks/chat/useChats";
import { useAuth } from "@/hooks/useAuth";
import { api, errorMessage } from "@/lib/api/client";
import { isGroupChat, oldestFirst } from "@/lib/chats";
import { uiPreview } from "@/lib/firebase/preview";
import { MAX_SOLO_CHATS, MAX_UPLOADS_PER_USER_PER_CHAT } from "@/lib/limits";

const TITLE_CHARS = 60;

/** The user said no to replacing their oldest chat. */
class NotStarted extends Error {
  constructor() {
    super("No chat was started.");
  }
}

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
  const { chats, createChat } = useChats();
  const confirm = useConfirm();
  const [busy, setBusy] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);
  const creating = useRef<Promise<string> | null>(null);
  const { chat } = useChat(chatId);

  /** At MAX_SOLO_CHATS, asks before the oldest solo chat is deleted (the server deletes it). */
  async function create(title: string): Promise<{ chatId: string }> {
    const solo = chats.filter((c) => c.ownerId === user?.uid && !isGroupChat(c));
    if (solo.length < MAX_SOLO_CHATS) return createChat(titleFrom(title));
    const ok = await confirm.ask({
      title: "Delete your oldest chat?",
      description: `You can keep ${MAX_SOLO_CHATS} chats. Starting a new one deletes "${oldestFirst(solo)[0].title}" with its messages and files.`,
      confirmLabel: "Delete and start",
      danger: true,
    });
    if (!ok) throw new NotStarted();
    return createChat(titleFrom(title), true);
  }

  function ensureChat(title: string): Promise<string> {
    creating.current ??= create(title).then(
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
      if (!(error instanceof NotStarted)) showToast(errorMessage(error));
      setBusy(false);
    }
  }

  const used = (user && chat?.uploadCounts?.[user.uid]) ?? 0;

  return (
    <>
      {confirm.dialog}
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
    </>
  );
}
