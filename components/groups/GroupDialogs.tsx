"use client";

import { useRouter } from "next/navigation";
import { shortName } from "@/components/chat/messageState";
import { InviteDialog } from "@/components/groups/InviteDialog";
import { MakeGroupDialog } from "@/components/groups/MakeGroupDialog";
import { MembersDialog } from "@/components/groups/MembersDialog";
import { showToast } from "@/components/ui/toastStore";
import { useGroupActions } from "@/hooks/chat/useGroupActions";
import type { ChatDoc, FileDoc, WithId } from "@/lib/types";

export type GroupDialog = "make-group" | "invite" | "members";

type GroupDialogsProps = {
  dialog: GroupDialog | null;
  onDialog: (dialog: GroupDialog | null) => void;
  chat: WithId<ChatDoc>;
  files: WithId<FileDoc>[];
  currentUid: string;
  onChatChange: (chat: WithId<ChatDoc>) => void;
  /** Keep only these file ids (files left out of a conversion are deleted). */
  onKeepFiles: (fileIds: string[]) => void;
  onSystemMessage: (text: string) => void;
};

/**
 * Make group, invite and members dialogs for one chat.
 * Integrates with useGroupActions for live server operations.
 */
export function GroupDialogs(props: GroupDialogsProps) {
  const { dialog, onDialog, chat, files, currentUid, onChatChange, onKeepFiles, onSystemMessage } = props;
  const router = useRouter();
  const actions = useGroupActions(chat.id);
  const members = chat.memberIds.flatMap((uid) => (chat.members[uid] ? [{ uid, ...chat.members[uid] }] : []));
  const me = chat.members[currentUid]?.name ?? "You";
  const owner = chat.members[chat.ownerId]?.name ?? "the owner";
  const close = () => onDialog(null);

  return (
    <>
      <MakeGroupDialog
        key={`make-${chat.id}`}
        open={dialog === "make-group"}
        onClose={close}
        files={files}
        onCreate={async ({ shareHistory, fileIds }) => {
          try {
            const res = await actions.convert({ shareHistory, fileIds });
            onKeepFiles(fileIds);
            showToast("Group created");
            if (res.chatId !== chat.id) {
              close();
              router.push(`/chat/${res.chatId}`);
            } else {
              onChatChange({ ...chat, inviteActive: true });
              onSystemMessage(
                shareHistory
                  ? `${me} made this a group`
                  : `${me} made this a group. Earlier messages stay private.`,
              );
              onDialog("invite");
            }
          } catch {
            // error toasted by hook
          }
        }}
      />
      <InviteDialog
        open={dialog === "invite"}
        onClose={close}
        memberNames={members.map((m) => m.name)}
        isOwner={chat.ownerId === currentUid}
        ownerName={shortName(owner)}
        token={chat.inviteActive ? chat.inviteToken : null}
        onRotate={async () => {
          try {
            const token = await actions.createInvite();
            onChatChange({ ...chat, inviteActive: true, inviteToken: token });
            showToast("New link ready. The old one stops working.");
          } catch {
            // error toasted by hook
          }
        }}
        onRevoke={async () => {
          try {
            await actions.revokeInvite();
            onChatChange({ ...chat, inviteActive: false });
            showToast("Link turned off");
          } catch {
            // error toasted by hook
          }
        }}
        onTurnOn={async () => {
          try {
            const token = await actions.createInvite();
            onChatChange({ ...chat, inviteActive: true, inviteToken: token });
            showToast("Link is on");
          } catch {
            // error toasted by hook
          }
        }}
      />
      <MembersDialog
        open={dialog === "members"}
        onClose={close}
        members={members}
        currentUid={currentUid}
        myFileNames={files.filter((f) => f.uploaderId === currentUid).map((f) => f.fileName)}
        onInvite={() => onDialog("invite")}
        onRemove={async (uid) => {
          try {
            const removed = chat.members[uid]?.name ?? "Member";
            await actions.removeMember(uid);
            const rest = Object.fromEntries(Object.entries(chat.members).filter(([id]) => id !== uid));
            onChatChange({ ...chat, memberIds: chat.memberIds.filter((id) => id !== uid), members: rest });
            onSystemMessage(`${shortName(me)} removed ${shortName(removed)}`);
            showToast(`${shortName(removed)} removed`);
          } catch {
            // error toasted by hook
          }
        }}
        onLeave={async (deleteMyFiles) => {
          try {
            await actions.leave(deleteMyFiles);
            close();
            showToast(deleteMyFiles ? "You left the group. Your files were deleted." : `You left ${chat.title}`);
            router.push("/chat");
          } catch {
            // error toasted by hook
          }
        }}
      />
    </>
  );
}
