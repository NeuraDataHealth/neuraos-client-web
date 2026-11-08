"use client";

import { useRef } from "react";
import { IconButton } from "@/components/ui/IconButton";
import { showToast } from "@/components/ui/toastStore";
import { ALLOWED_MIME, MAX_FILE_BYTES, MAX_UPLOADS_PER_USER_PER_CHAT, UPLOADS_PER_DAY } from "@/lib/limits";

type AttachButtonProps = {
  /** Uploads still allowed here: the smaller of this chat's and today's allowance. */
  remaining: number;
  /** Which allowance `remaining` comes from, for the message. */
  limitedBy: "chat" | "day";
  /** Upload bytes left today (Infinity while unknown). */
  bytesLeft: number;
  onFiles: (files: File[]) => void;
};

const allowed: readonly string[] = ALLOWED_MIME;
const MB = 1024 * 1024;

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

/** Why no more files can be picked, in the user's terms. */
function limitMessage(limitedBy: "chat" | "day", remaining: number): string {
  if (limitedBy === "day") {
    return remaining <= 0
      ? `You've used today's ${UPLOADS_PER_DAY} uploads. Try again tomorrow.`
      : `You have ${plural(remaining, "upload")} left today.`;
  }
  return remaining <= 0
    ? `You can upload ${MAX_UPLOADS_PER_USER_PER_CHAT} files per chat.`
    : `You can add ${plural(remaining, "more file")} to this chat.`;
}

/** "+" key that opens the file picker and checks type, size and the upload allowances first. */
export function AttachButton({ remaining, limitedBy, bytesLeft, onFiles }: AttachButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function pick(list: FileList | null) {
    const files = Array.from(list ?? []);
    if (inputRef.current) inputRef.current.value = "";
    if (files.length === 0) return;
    if (files.some((file) => !allowed.includes(file.type))) return showToast("Upload a PDF, Word (.docx), JPEG, PNG or WEBP file.");
    if (files.some((file) => file.size > MAX_FILE_BYTES)) return showToast("Files can be up to 10 MB.");
    if (files.length > remaining) return showToast(limitMessage(limitedBy, remaining));
    if (files.reduce((sum, file) => sum + file.size, 0) > bytesLeft) {
      return showToast(`You have ${Math.max(0, Math.floor(bytesLeft / MB))} MB of uploads left today.`);
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
        label={remaining > 0 ? "Attach a file" : limitMessage(limitedBy, remaining)}
        look="outline"
        size="md"
        aria-disabled={remaining <= 0}
        onClick={() => (remaining > 0 ? inputRef.current?.click() : showToast(limitMessage(limitedBy, remaining)))}
      />
    </>
  );
}
