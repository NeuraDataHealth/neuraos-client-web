"use client";

import { collection, orderBy, query } from "firebase/firestore";
import { useCollection } from "@/hooks/firestore/useCollection";
import { clientDb } from "@/lib/firebase/client";
import { uiPreview } from "@/lib/firebase/preview";
import { messagesByChat } from "@/lib/fixtures/messages";
import type { MessageDoc, WithId } from "@/lib/types";

export type UseMessagesResult = {
  messages: WithId<MessageDoc>[];
  loading: boolean;
  error: Error | null;
};

/**
 * Live Firestore query for a chat's messages, chronological order.
 * Replaces fixture `messagesByChat` in ChatScreenContainer.
 */
export function useMessages(chatId: string): UseMessagesResult {
  const key = uiPreview ? null : chatId ? `messages:${chatId}` : null;
  const live = useCollection<MessageDoc>(key, () =>
    query(
      collection(clientDb(), "chats", chatId, "messages"),
      orderBy("createdAt", "asc"),
    ),
  );

  if (uiPreview) {
    return {
      messages: messagesByChat[chatId] ?? [],
      loading: false,
      error: null,
    };
  }

  return {
    messages: live.data,
    loading: live.loading,
    error: live.error,
  };
}
