"use client";

import { useCallback, useState } from "react";
import type { FileChipStatus } from "@/components/chat/FileChip";
import { showToast } from "@/components/ui/toastStore";
import { api, uploadToTarget } from "@/lib/api/client";
import { uiPreview } from "@/lib/firebase/preview";
import { ALLOWED_MIME, MAX_FILE_BYTES, type AllowedMime } from "@/lib/limits";

export type UploadItem = {
  key: string;
  name: string;
  mimeType: string;
  sizeBytes: number;
  status: FileChipStatus;
  /** Set once the server has reserved the upload; it then counts toward the chat's upload limit. */
  fileId?: string;
  chatId?: string;
  error?: string;
};

export type UseUpload = {
  uploads: UploadItem[];
  add: (files: File[]) => Promise<void>;
  remove: (key: string) => Promise<void>;
  clear: () => void;
};

/**
 * The chat to upload into: its id, or a function that creates the chat on first
 * use (the new-chat screen) and is called with the first file's name.
 */
export type UploadTarget = string | ((fileName: string) => Promise<string>);

/**
 * Uploads files to a chat:
 * 1. POST /api/chats/:id/files/upload-url (reserves one upload; checks quota, size, MIME)
 * 2. PUT straight to the Cloud Storage signed URL
 * 3. POST /api/chats/:id/files/:fileId/complete (verifies the object and runs extraction)
 */
export function useUpload(target?: UploadTarget): UseUpload {
  const [uploads, setUploads] = useState<UploadItem[]>([]);

  const patch = useCallback((key: string, change: Partial<UploadItem>) => {
    setUploads((list) => list.map((u) => (u.key === key ? { ...u, ...change } : u)));
  }, []);

  const uploadOne = useCallback(
    async (file: File, key: string) => {
      if (file.size > MAX_FILE_BYTES) {
        patch(key, { status: "failed", error: "File exceeds 10 MB limit." });
        return showToast(`"${file.name}" is over the 10 MB limit.`);
      }
      if (!ALLOWED_MIME.includes(file.type as AllowedMime)) {
        patch(key, { status: "failed", error: "Unsupported format." });
        return showToast(`"${file.name}" isn't a PDF, Word (.docx), JPEG, PNG or WEBP file.`);
      }
      if (uiPreview) {
        setTimeout(() => patch(key, { status: "processing" }), 400);
        setTimeout(() => patch(key, { status: "ready" }), 1200);
        return;
      }

      let reserved: { chatId: string; fileId: string } | null = null;
      let completing = false;
      try {
        if (!target) throw new Error("Start a chat first.");
        const chatId = typeof target === "string" ? target : await target(file.name);
        const upload = await api.files.uploadUrl(chatId, {
          fileName: file.name,
          mimeType: file.type as AllowedMime,
          sizeBytes: file.size,
        });
        reserved = { chatId, fileId: upload.fileId };
        patch(key, { chatId, fileId: upload.fileId });

        await uploadToTarget(upload, file);
        patch(key, { status: "processing" });

        completing = true;
        const result = await api.files.complete(chatId, upload.fileId);
        patch(key, { status: result.status });
        if (result.status === "failed") showToast(`Couldn't read "${file.name}". Remove it and try another file.`);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Upload failed.";
        patch(key, { status: "failed", error: message });
        showToast(`Upload failed for "${file.name}": ${message}`);
        // The PUT never finished: `complete` finds no object and gives the upload back.
        if (reserved && !completing) void api.files.complete(reserved.chatId, reserved.fileId).catch(() => {});
      }
    },
    [target, patch],
  );

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
      // One at a time, so the new-chat screen creates its chat once.
      for (let i = 0; i < files.length; i++) await uploadOne(files[i], added[i].key);
    },
    [uploadOne],
  );

  const remove = useCallback(
    async (key: string) => {
      const item = uploads.find((u) => u.key === key);
      setUploads((list) => list.filter((u) => u.key !== key));
      // Deleting does not give the upload back (SPEC.md section 8).
      if (item?.chatId && item.fileId) await api.files.remove(item.chatId, item.fileId).catch(() => {});
    },
    [uploads],
  );

  const clear = useCallback(() => setUploads([]), []);

  return { uploads, add, remove, clear };
}
