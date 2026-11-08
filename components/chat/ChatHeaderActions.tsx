import { DeleteChatButton } from "@/components/chat/DeleteChatButton";
import { Button } from "@/components/ui/Button";
import { AvatarStack } from "@/components/ui/AvatarStack";
import { Icon } from "@/components/ui/Icon";

type ChatHeaderActionsProps = {
  isGroup: boolean;
  isOwner: boolean;
  title: string;
  /** Owner only; absent in UI preview. */
  onDelete?: () => Promise<void>;
  memberNames: string[];
  onMakeGroup: () => void;
  onMembers: () => void;
  onInvite: () => void;
};

/** Top-bar actions: "Make group" on the owner's solo chat; members and "Invite" in a group; delete for the owner. */
export function ChatHeaderActions(props: ChatHeaderActionsProps) {
  const { isGroup, isOwner, title, onDelete, memberNames, onMakeGroup, onMembers, onInvite } = props;
  const remove = isOwner && onDelete && <DeleteChatButton isGroup={isGroup} title={title} onDelete={onDelete} />;
  if (!isGroup) {
    if (!isOwner) return null;
    return (
      <div className="flex shrink-0 items-center gap-1.5">
        {remove}
        <Button look="app-light-sm" onClick={onMakeGroup} className="pl-3.25">
          <Icon name="user-plus" size={17} />
          <span className="max-sm:sr-only">Make group</span>
        </Button>
      </div>
    );
  }
  return (
    <div className="flex shrink-0 items-center gap-2.5">
      {remove}
      <button
        type="button"
        onClick={onMembers}
        aria-label={`Members: ${memberNames.join(", ")}`}
        className="flex h-10 cursor-pointer items-center px-1 max-sm:hidden"
      >
        <AvatarStack names={memberNames} />
      </button>
      <Button look="app-accent-sm" onClick={onInvite} className="pl-3.25">
        <Icon name="link" size={15} />
        Invite
      </Button>
    </div>
  );
}
