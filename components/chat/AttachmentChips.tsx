import { FileChip } from "@/components/chat/FileChip";
import type { FileDoc } from "@/lib/types";

type AttachmentChipsProps = {
  ids: string[];
  files: Record<string, FileDoc>;
};

/** Files a message refers to, as chips (attachments above a bubble, citations under an answer). */
export function AttachmentChips({ ids, files }: AttachmentChipsProps) {
  const attached = ids.flatMap((id) => (files[id] ? [{ id, file: files[id] }] : []));
  if (attached.length === 0) return null;
  return (
    <span className="flex flex-wrap gap-2">
      {attached.map(({ id, file }) => (
        <FileChip key={id} name={file.fileName} status={file.status} />
      ))}
    </span>
  );
}
