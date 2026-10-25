"use client";

import { useRef } from "react";
import { FileChip, type FileChipStatus } from "@/components/chat/FileChip";
import { Icon } from "@/components/ui/Icon";
import { Text } from "@/components/ui/Text";
import { showToast } from "@/components/ui/toastStore";
import { MAX_VERIFICATION_DOC_BYTES } from "@/lib/limits";

const ACCEPT = ["application/pdf", "image/jpeg", "image/png"];

type UploadTileProps = {
  label: string;
  hint: string;
  file: { name: string; status: FileChipStatus } | null;
  onPick: (file: File) => void;
  onRemove: () => void;
};

/** Dashed drop target for one verification document; shows the picked file as a chip. */
export function UploadTile({ label, hint, file, onPick, onRemove }: UploadTileProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function pick(list: FileList | null) {
    const picked = list?.[0];
    if (inputRef.current) inputRef.current.value = "";
    if (!picked) return;
    if (!ACCEPT.includes(picked.type)) return showToast("Upload a PDF, JPEG or PNG.");
    if (picked.size > MAX_VERIFICATION_DOC_BYTES) return showToast("Documents can be up to 10 MB.");
    onPick(picked);
  }

  return (
    <div className="flex min-w-0 flex-col gap-2.5 rounded-callout border border-dashed border-ink/18 bg-callout p-4">
      <input ref={inputRef} type="file" accept={ACCEPT.join(",")} hidden onChange={(event) => pick(event.target.files)} />
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-line bg-paper text-copy">
          <Icon name="file" size={17} />
        </span>
        <div className="min-w-0 flex-1">
          <Text as="p" variant="ui-md">
            {label}
          </Text>
          <Text variant="caption" className="mt-0.5 text-muted">
            {hint}
          </Text>
        </div>
      </div>
      {file ? (
        <FileChip name={file.name} status={file.status} onRemove={onRemove} />
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex h-10 cursor-pointer items-center justify-center gap-2 rounded-full border border-line-strong bg-linear-to-b from-key-light to-key-light-end text-ink shadow-key-light-sm active:translate-y-0.5"
        >
          <Icon name="plus-sm" size={12} />
          <Text as="span" variant="button-sm">
            Choose file
          </Text>
        </button>
      )}
    </div>
  );
}
