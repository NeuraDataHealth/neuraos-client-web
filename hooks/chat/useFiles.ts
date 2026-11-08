"use client";

import { collection, orderBy, query } from "firebase/firestore";
import { useCollection } from "@/hooks/firestore/useCollection";
import { clientDb } from "@/lib/firebase/client";
import { uiPreview } from "@/lib/firebase/preview";
import { filesByChat } from "@/lib/fixtures/files";
import type { FileDoc, WithId } from "@/lib/types";

export type UseFilesResult = {
  files: WithId<FileDoc>[];
  loading: boolean;
  error: Error | null;
};

/**
 * Live Firestore query for a chat's uploaded files.
 * Replaces fixture `filesByChat` in ChatScreenContainer.
 */
export function useFiles(chatId: string): UseFilesResult {
  const key = uiPreview ? null : chatId ? `files:${chatId}` : null;
  const live = useCollection<FileDoc>(key, () =>
    query(
      collection(clientDb(), "chats", chatId, "files"),
      orderBy("createdAt", "asc"),
    ),
  );

  if (uiPreview) {
    return {
      files: filesByChat[chatId] ?? [],
      loading: false,
      error: null,
    };
  }

  return {
    files: live.data,
    loading: live.loading,
    error: live.error,
  };
}
