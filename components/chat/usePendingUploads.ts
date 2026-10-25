"use client";

import { useEffect, useRef, useState } from "react";
import type { FileChipStatus } from "@/components/chat/FileChip";

export type PendingUpload = {
  key: string;
  name: string;
  mimeType: string;
  sizeBytes: number;
  status: FileChipStatus;
};

/**
 * Files picked in the composer, stepping through uploading → reading → ready.
 * Static stand-in: at integration this becomes useUpload (upload-url, PUT, complete)
 * from hooks/chat, with the same shape.
 */
export function usePendingUploads() {
  const [uploads, setUploads] = useState<PendingUpload[]>([]);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  const setStatus = (key: string, status: FileChipStatus) =>
    setUploads((list) => list.map((u) => (u.key === key ? { ...u, status } : u)));

  function add(files: File[]) {
    const added = files.map((file) => ({
      key: `${file.name}-${file.size}-${file.lastModified}`,
      name: file.name,
      mimeType: file.type,
      sizeBytes: file.size,
      status: "uploading" as const,
    }));
    setUploads((list) => [...list, ...added.filter((a) => !list.some((u) => u.key === a.key))]);
    for (const upload of added) {
      timers.current.push(setTimeout(() => setStatus(upload.key, "processing"), 700));
      timers.current.push(setTimeout(() => setStatus(upload.key, "ready"), 2200));
    }
  }

  return {
    uploads,
    add,
    remove: (key: string) => setUploads((list) => list.filter((u) => u.key !== key)),
    clear: () => setUploads([]),
  };
}
