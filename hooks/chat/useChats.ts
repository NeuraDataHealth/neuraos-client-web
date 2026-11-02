"use client";

import { collection, orderBy, query, where } from "firebase/firestore";
import { useCallback } from "react";
import { useCollection } from "@/hooks/firestore/useCollection";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api/client";
import { clientDb } from "@/lib/firebase/client";
import { uiPreview } from "@/lib/firebase/preview";
import { chats as fixtureChats } from "@/lib/fixtures/chats";
import type { ChatDoc, WithId } from "@/lib/types";

export type UseChatsResult = {
  chats: WithId<ChatDoc>[];
  loading: boolean;
  error: Error | null;
  createChat: (title?: string) => Promise<{ chatId: string }>;
};

/**
 * Live Firestore query for the user's chats, newest activity first.
 * Replaces fixture `chats` in ChatSidebarContainer.
 */
export function useChats(): UseChatsResult {
  const { user } = useAuth();

  const key = uiPreview ? null : user ? `chats:${user.uid}` : null;
  const live = useCollection<ChatDoc>(key, () =>
    query(
      collection(clientDb(), "chats"),
      where("memberIds", "array-contains", user?.uid ?? ""),
      orderBy("lastMessageAt", "desc"),
    ),
  );

  const createChat = useCallback(async (title?: string) => {
    return api.chats.create({ title });
  }, []);

  if (uiPreview) {
    return {
      chats: fixtureChats,
      loading: false,
      error: null,
      createChat,
    };
  }

  return {
    chats: live.data,
    loading: live.loading,
    error: live.error,
    createChat,
  };
}
