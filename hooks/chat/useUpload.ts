"use client";

import { useCallback, useState } from "react";
import type { FileChipStatus } from "@/components/chat/FileChip";
import { showToast } from "@/components/ui/toastStore";
import { api, uploadToTarget } from "@/lib/api/client";
import { ALLOWED_MIME, MAX_FILE_BYTES, type AllowedMime } from "@/lib/limits";

export type UploadItem = {
  key: string;
  name: string;
  mimeType: string;
  sizeBytes: number;
  status: FileChipStatus;
  fileId?: string;
  error?: string;
};

export type UseUpload = {
  uploads: UploadItem[];
  add: (files: File[]) => Promise<void>;
  remove: (key: string) => Promise<void>;
  clear: () => void;
};

/**
 * Uploads files to a chat:
 * 1. POST /api/chats/:id/files/upload-url (checks quota, size, MIME)
 * 2. PUT straight to Cloud Storage signed URL
 * 3. POST /api/chats/:id/files/:fileId/complete (verifies and runs AI extraction)
 */
export function useUpload(chatId?: string): UseUpload {
  const [uploads, setUploads] = useState<UploadItem[]>([]);

  const setStatus = useCallback((key: string, status: FileChipStatus, fileId?: string, error?: string) => {
    setUploads((list) =>
      list.map((u) => (u.key === key ? { ...u, status, ...(fileId ? { fileId } : {}), ...(error ? { error } : {}) } : u))
    );
  }, []);

  const add = useCallback(
    async (files: File[]) => {
      const added: UploadItem[] = files.map((file) => ({
        key: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2, 7)}`,
        name: file.name,
        mimeType: file.type,
        sizeBytes: file.size,
        status: "uploading",
      }));

      setUploads((list) => [...list, ...added]);

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const item = added[i];

        if (file.size > MAX_FILE_BYTES) {
          setStatus(item.key, "failed", undefined, "File exceeds 10 MB limit.");
          showToast(`"${file.name}" exceeds the 10 MB limit.`);
          continue;
        }

        if (!ALLOWED_MIME.includes(file.type as AllowedMime)) {
          setStatus(item.key, "failed", undefined, "Unsupported format.");
          showToast(`"${file.name}" is not an accepted format (PDF, PNG, JPEG only).`);
          continue;
        }

        if (!chatId) {
          setTimeout(() => setStatus(item.key, "processing"), 400);
          setTimeout(() => setStatus(item.key, "ready"), 1200);
          continue;
        }

        try {
          const target = await api.files.uploadUrl(chatId, {
            fileName: file.name,
            mimeType: file.type as AllowedMime,
            sizeBytes: file.size,
          });

          await uploadToTarget(target, file);

          setStatus(item.key, "processing", target.fileId);

          const completeRes = await api.files.complete(chatId, target.fileId);
          setStatus(item.key, completeRes.status, target.fileId);
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Upload failed";
          setStatus(item.key, "failed", undefined, msg);
          showToast(`Upload failed for "${file.name}": ${msg}`);
        }
      }
    },
    [chatId, setStatus]
  );

  const remove = useCallback(
    async (key: string) => {
      const target = uploads.find((u) => u.key === key);
      setUploads((list) => list.filter((u) => u.key !== key));
      if (chatId && target?.fileId) {
        try {
          await api.files.remove(chatId, target.fileId);
        } catch {
          // Ignore delete error
        }
      }
    },
    [chatId, uploads]
  );

  const clear = useCallback(() => setUploads([]), []);

  return { uploads, add, remove, clear };
}
