"use client";

import { useParams } from "next/navigation";
import { useUpload, type UploadItem } from "@/hooks/chat/useUpload";

export type PendingUpload = UploadItem;

/**
 * Files picked in the composer, stepping through uploading → processing → ready.
 * Reads the active chatId from the route params if available.
 */
export function usePendingUploads(explicitChatId?: string) {
  const params = useParams<{ chatId?: string }>();
  const chatId = explicitChatId ?? params?.chatId;
  return useUpload(chatId);
}
