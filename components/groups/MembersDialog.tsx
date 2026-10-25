"use client";

import { useState } from "react";
import { shortName } from "@/components/chat/messageState";
import { LeaveOptions } from "@/components/groups/LeaveOptions";
import { MemberRow } from "@/components/groups/MemberRow";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { MAX_MEMBERS } from "@/lib/limits";
import type { ChatMember } from "@/lib/types";

type Step = { kind: "list" } | { kind: "remove"; uid: string } | { kind: "leave" };

type MembersDialogProps = {
  open: boolean;
  onClose: () => void;
  members: (ChatMember & { uid: string })[];
  currentUid: string;
  /** Names of files the current user shared here (leave step). */
  myFileNames: string[];
  onInvite: () => void;
  onRemove: (uid: string) => void;
  onLeave: (deleteMyFiles: boolean) => void;
};

/** Member list, the owner's remove step and a member's leave step in one dialog. */
export function MembersDialog(props: MembersDialogProps) {
  const { open, onClose, members, currentUid, myFileNames, onInvite, onRemove, onLeave } = props;
  const [step, setStep] = useState<Step>({ kind: "list" });
  const [deleteMyFiles, setDeleteMyFiles] = useState(false);

  const owner = members.find((m) => m.role === "owner");
  const isOwner = owner?.uid === currentUid;
  const removing = step.kind === "remove" ? members.find((m) => m.uid === step.uid) : undefined;
  const close = () => {
    setStep({ kind: "list" });
    setDeleteMyFiles(false);
    onClose();
  };
  const back = () => setStep({ kind: "list" });

  const header =
    step.kind === "remove"
      ? {
          title: `Remove ${removing?.name ?? "member"}?`,
          description: "They lose access to this chat and its shared files straight away. Files they shared stay in the chat.",
        }
      : step.kind === "leave"
        ? {
            title: "Leave this group?",
            description: `You lose access to the chat and its shared files. ${owner ? shortName(owner.name) : "The owner"} can invite you back.`,
          }
        : { title: "Members", description: undefined };

  return (
    <Dialog
      open={open}
      onClose={close}
      title={header.title}
      description={header.description}
      badge={step.kind === "list" ? `${members.length} of ${MAX_MEMBERS}` : undefined}
    >
      {step.kind === "list" && (
        <div className="flex flex-col gap-4.5">
          <ul className="divide-y divide-ink/8 overflow-hidden rounded-callout border border-ink/8">
            {members.map((m) => (
              <MemberRow
                key={m.uid}
                member={m}
                isYou={m.uid === currentUid}
                onRemove={isOwner && m.uid !== currentUid ? () => setStep({ kind: "remove", uid: m.uid }) : undefined}
              />
            ))}
          </ul>
          <div className="flex flex-wrap items-center gap-2.5">
            {!isOwner && (
              <Button look="app-danger-outline" onClick={() => setStep({ kind: "leave" })}>
                Leave group
              </Button>
            )}
            <span className="flex-1" />
            {members.length < MAX_MEMBERS && (
              <Button look="app-light-md" onClick={onInvite}>
                Invite
              </Button>
            )}
            <Button look="app-accent-md" onClick={close}>
              Done
            </Button>
          </div>
        </div>
      )}

      {step.kind === "remove" && (
        <div className="flex flex-wrap justify-end gap-2.5">
          <Button look="app-light-md" onClick={back}>
            Cancel
          </Button>
          <Button
            look="app-danger-md"
            onClick={() => {
              onRemove(step.uid);
              back();
            }}
          >
            Remove
          </Button>
        </div>
      )}

      {step.kind === "leave" && (
        <div className="flex flex-col gap-5">
          <LeaveOptions myFileNames={myFileNames} deleteMyFiles={deleteMyFiles} onChange={setDeleteMyFiles} />
          <div className="flex flex-wrap justify-end gap-2.5">
            <Button look="app-light-md" onClick={back}>
              Cancel
            </Button>
            <Button look="app-danger-md" onClick={() => onLeave(deleteMyFiles)}>
              Leave
            </Button>
          </div>
        </div>
      )}
    </Dialog>
  );
}
