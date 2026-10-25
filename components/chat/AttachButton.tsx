"use client";

import { useRef } from "react";
import { IconButton } from "@/components/ui/IconButton";
import { showToast } from "@/components/ui/toastStore";
import { ALLOWED_MIME, MAX_FILE_BYTES, MAX_UPLOADS_PER_USER_PER_CHAT } from "@/lib/limits";

type AttachButtonProps = {
  /** Uploads this user can still make in this chat (counts uploads ever made). */
  remaining: number;
  onFiles: (files: File[]) => void;
};

const allowed: readonly string[] = ALLOWED_MIME;

/** "+" key that opens the file picker and checks type, size and the per-chat upload limit first. */
export function AttachButton({ remaining, onFiles }: AttachButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function pick(list: FileList | null) {
    const files = Array.from(list ?? []);
    if (inputRef.current) inputRef.current.value = "";
    if (files.length === 0) return;
    if (files.some((file) => !allowed.includes(file.type))) return showToast("Upload a PDF, JPEG or PNG.");
    if (files.some((file) => file.size > MAX_FILE_BYTES)) return showToast("Files can be up to 10 MB.");
    if (files.length > remaining) {
      return showToast(`You can upload ${MAX_UPLOADS_PER_USER_PER_CHAT} files per chat.`);
    }
    onFiles(files);
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_MIME.join(",")}
        multiple
        hidden
        onChange={(event) => pick(event.target.files)}
      />
      <IconButton
        icon="plus"
        label={remaining > 0 ? "Attach a file" : "Upload limit reached for this chat"}
        look="outline"
        size="md"
        aria-disabled={remaining <= 0}
        onClick={() =>
          remaining > 0
            ? inputRef.current?.click()
            : showToast(`You can upload ${MAX_UPLOADS_PER_USER_PER_CHAT} files per chat.`)
        }
      />
    </>
  );
}
