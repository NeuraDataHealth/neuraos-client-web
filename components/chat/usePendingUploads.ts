"use client";

import { useParams } from "next/navigation";
import { useUpload, type UploadItem, type UploadTarget } from "@/hooks/chat/useUpload";

export type PendingUpload = UploadItem;

/**
 * Files picked in the composer, stepping through uploading → processing → ready.
 * Uploads into `target` when given (the new-chat screen), otherwise into the open chat.
 */
export function usePendingUploads(target?: UploadTarget) {
  const params = useParams<{ chatId?: string }>();
  return useUpload(target ?? params?.chatId);
}
