"use client";

import { useRouter } from "next/navigation";
import { shortName } from "@/components/chat/messageState";
import { InviteDialog } from "@/components/groups/InviteDialog";
import { newInviteToken } from "@/components/groups/inviteToken";
import { MakeGroupDialog } from "@/components/groups/MakeGroupDialog";
import { MembersDialog } from "@/components/groups/MembersDialog";
import { showToast } from "@/components/ui/toastStore";
import type { ChatDoc, FileDoc } from "@/lib/types";

export type GroupDialog = "make-group" | "invite" | "members";

type WithId<T> = T & { id: string };

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
 * Make group, invite and members dialogs for one chat. Static: changes apply
 * to local state; at integration each action calls its api.groups helper.
 */
export function GroupDialogs(props: GroupDialogsProps) {
  const { dialog, onDialog, chat, files, currentUid, onChatChange, onKeepFiles, onSystemMessage } = props;
  const router = useRouter();
  const members = chat.memberIds.flatMap((uid) => (chat.members[uid] ? [{ uid, ...chat.members[uid] }] : []));
  const me = chat.members[currentUid]?.name ?? "You";
  const owner = chat.members[chat.ownerId]?.name ?? "the owner";
  const close = () => onDialog(null);

  const setLink = (active: boolean, message: string) => {
    onChatChange({ ...chat, inviteActive: active, inviteToken: active ? newInviteToken() : chat.inviteToken });
    showToast(message);
  };

  return (
    <>
      <MakeGroupDialog
        key={`make-${chat.id}`}
        open={dialog === "make-group"}
        onClose={close}
        files={files}
        onCreate={({ shareHistory, fileIds }) => {
          onKeepFiles(fileIds);
          onChatChange({ ...chat, inviteToken: newInviteToken(), inviteActive: true });
          onSystemMessage(
            shareHistory
              ? `${me} made this a group`
              : `${me} made this a group. Earlier messages stay private.`,
          );
          showToast("Group created");
          onDialog("invite");
        }}
      />
      <InviteDialog
        open={dialog === "invite"}
        onClose={close}
        memberNames={members.map((m) => m.name)}
        isOwner={chat.ownerId === currentUid}
        ownerName={shortName(owner)}
        token={chat.inviteActive ? chat.inviteToken : null}
        onRotate={() => setLink(true, "New link ready. The old one stops working.")}
        onRevoke={() => setLink(false, "Link turned off")}
        onTurnOn={() => setLink(true, "Link is on")}
      />
      <MembersDialog
        open={dialog === "members"}
        onClose={close}
        members={members}
        currentUid={currentUid}
        myFileNames={files.filter((f) => f.uploaderId === currentUid).map((f) => f.fileName)}
        onInvite={() => onDialog("invite")}
        onRemove={(uid) => {
          const removed = chat.members[uid]?.name ?? "Member";
          const rest = Object.fromEntries(Object.entries(chat.members).filter(([id]) => id !== uid));
          onChatChange({ ...chat, memberIds: chat.memberIds.filter((id) => id !== uid), members: rest });
          onSystemMessage(`${shortName(me)} removed ${shortName(removed)}`);
          showToast(`${shortName(removed)} removed`);
        }}
        onLeave={(deleteMyFiles) => {
          close();
          showToast(deleteMyFiles ? "You left the group. Your files were deleted." : `You left ${chat.title}`);
          router.push("/chat");
        }}
      />
    </>
  );
}
