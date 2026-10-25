import { clsx } from "clsx";
import type { FileDoc } from "@/lib/types";
import { Text } from "@/components/ui/Text";
import { fileKind } from "@/components/chat/fileFormat";

type CaseFilesProps = {
  files: (FileDoc & { id: string })[];
};

/** The open chat's shared files, as two-up cards in the sidebar. */
export function CaseFiles({ files }: CaseFilesProps) {
  if (files.length === 0) return null;
  return (
    <section aria-labelledby="case-files">
      <Text as="h2" id="case-files" variant="badge" className="px-1.5 pb-2.5 text-muted">
        Case files
      </Text>
      <ul className="grid grid-cols-2 gap-2">
        {files.map((file) => (
          <li
            key={file.id}
            className={clsx(
              "min-w-0 rounded-tile border bg-paper p-3 shadow-card-sm",
              file.status === "failed" ? "border-danger/30" : "border-ink/8",
            )}
          >
            <Text variant="card-title" className="truncate">
              {file.fileName}
            </Text>
            <Text variant="mono-meta" className="mt-1.5 truncate text-muted">
              {file.status === "ready"
                ? `${fileKind(file.mimeType)} · ${file.uploaderName.replace(/^Dr\.?\s*/, "")}`
                : file.status === "processing"
                  ? "Reading…"
                  : "Couldn't read"}
            </Text>
          </li>
        ))}
      </ul>
    </section>
  );
}
