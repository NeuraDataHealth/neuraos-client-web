"use client";

import { useState } from "react";
import { fileKind } from "@/components/chat/fileFormat";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Dialog } from "@/components/ui/Dialog";
import { Notice } from "@/components/ui/Notice";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Text } from "@/components/ui/Text";
import { Toggle } from "@/components/ui/Toggle";
import type { ConvertRequest } from "@/lib/contracts/groups";
import type { FileDoc } from "@/lib/types";

type MakeGroupDialogProps = {
  open: boolean;
  onClose: () => void;
  files: (FileDoc & { id: string })[];
  onCreate: (request: ConvertRequest) => void;
};

/** Owner's consent step before a chat becomes a group (SPEC.md section 9). */
export function MakeGroupDialog({ open, onClose, files, onCreate }: MakeGroupDialogProps) {
  const [shareHistory, setShareHistory] = useState(true);
  const [selected, setSelected] = useState<string[]>(() => files.map((f) => f.id));

  const toggleFile = (id: string) =>
    setSelected((list) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Make this a group"
      description="Invite up to 2 colleagues to work on this case with you and NeuraOS."
    >
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-3.5 rounded-callout border border-ink/7 bg-callout py-3.5 pr-3.5 pl-4">
          <div className="min-w-0 flex-1">
            <Text as="p" id="share-history" variant="ui-md">
              Share previous messages with people who join
            </Text>
            <Text variant="body-sm" className="mt-0.75 text-muted">
              {shareHistory ? "They see the whole conversation so far." : "They only see messages sent after they join."}
            </Text>
          </div>
          <Toggle checked={shareHistory} onCheckedChange={setShareHistory} aria-labelledby="share-history" />
        </div>

        <div>
          <SectionLabel
            as="h3"
            aside={
              files.length > 0 && (
                <Text as="span" variant="mono-sm" className="text-faint">
                  {selected.length} of {files.length} selected
                </Text>
              )
            }
          >
            Files to share
          </SectionLabel>
          {files.length > 0 ? (
            <ul className="divide-y divide-ink/7 overflow-hidden rounded-callout border border-ink/8">
              {files.map((file) => (
                <li key={file.id} className="bg-paper px-4 py-4 hover:bg-callout">
                  <Checkbox checked={selected.includes(file.id)} onChange={() => toggleFile(file.id)} className="items-center">
                    <span className="flex items-center gap-3">
                      <Text as="span" variant="body-lg" className="min-w-0 flex-1 truncate">
                        {file.fileName}
                      </Text>
                      <Text as="span" variant="mono-meta" className="text-faint">
                        {fileKind(file.mimeType)}
                      </Text>
                    </span>
                  </Checkbox>
                </li>
              ))}
            </ul>
          ) : (
            <Notice tone="empty">No files in this chat yet.</Notice>
          )}
        </div>

        <Notice tone="warning">
          Don&apos;t post patient names or identifiers. Everyone in the group can see shared files and ask the AI about them.
        </Notice>

        <div className="flex flex-wrap justify-end gap-2.5">
          <Button look="app-light-md" onClick={onClose}>
            Cancel
          </Button>
          <Button look="app-accent-md" onClick={() => onCreate({ shareHistory, fileIds: selected })}>
            Create group
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
