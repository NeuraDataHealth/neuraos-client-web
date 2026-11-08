"use client";

import { useDocument } from "@/hooks/firestore/useDocument";
import { uiPreview } from "@/lib/firebase/preview";
import { chats as fixtureChats } from "@/lib/fixtures/chats";
import type { ChatDoc, WithId } from "@/lib/types";

export type UseChatResult = {
  chat: WithId<ChatDoc> | null;
  loading: boolean;
  error: Error | null;
};

/**
 * Live Firestore document for one chat.
 * Replaces fixture lookup in ChatScreenContainer.
 */
export function useChat(chatId: string | null): UseChatResult {
  const live = useDocument<ChatDoc>(uiPreview || !chatId ? null : `chats/${chatId}`);

  if (uiPreview) {
    const fixture = fixtureChats.find((c) => c.id === chatId) ?? null;
    return {
      chat: fixture,
      loading: false,
      error: null,
    };
  }

  return {
    chat: live.data,
    loading: live.loading,
    error: live.error,
  };
}
