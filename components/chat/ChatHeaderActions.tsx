import { Button } from "@/components/ui/Button";
import { AvatarStack } from "@/components/ui/AvatarStack";
import { Icon } from "@/components/ui/Icon";

type ChatHeaderActionsProps = {
  isGroup: boolean;
  isOwner: boolean;
  memberNames: string[];
  onMakeGroup: () => void;
  onMembers: () => void;
  onInvite: () => void;
};

/** Top-bar actions: "Make group" on the owner's solo chat; members and "Invite" in a group. */
export function ChatHeaderActions({ isGroup, isOwner, memberNames, onMakeGroup, onMembers, onInvite }: ChatHeaderActionsProps) {
  if (!isGroup) {
    if (!isOwner) return null;
    return (
      <Button look="app-light-sm" onClick={onMakeGroup} className="pl-3.25">
        <Icon name="user-plus" size={17} />
        <span className="max-sm:sr-only">Make group</span>
      </Button>
    );
  }
  return (
    <div className="flex shrink-0 items-center gap-2.5">
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
