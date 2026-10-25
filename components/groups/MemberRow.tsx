import { joinedLabel } from "@/components/groups/joinedLabel";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { StatusPill } from "@/components/ui/StatusPill";
import { Text } from "@/components/ui/Text";
import type { ChatMember } from "@/lib/types";

type MemberRowProps = {
  member: ChatMember;
  isYou: boolean;
  /** Owner removing someone else. */
  onRemove?: () => void;
};

/** Avatar, name, when they joined, role pill and (for the owner) Remove. */
export function MemberRow({ member, isYou, onRemove }: MemberRowProps) {
  return (
    <li className="flex min-h-17 items-center gap-3 py-3 pr-3 pl-3.5">
      <Avatar name={member.name} size="md" />
      <div className="min-w-0 flex-1">
        <Text variant="ui-md" className="truncate">
          {member.name}
          {isYou && <span className="font-normal text-faint"> · You</span>}
        </Text>
        <Text variant="meta-md" className="mt-0.5 text-muted">
          {joinedLabel(member.joinedAt)}
        </Text>
      </div>
      <StatusPill tone={member.role === "owner" ? "blue" : "grey"}>
        {member.role === "owner" ? "Owner" : "Member"}
      </StatusPill>
      {onRemove && (
        <Button look="app-danger-ghost" onClick={onRemove} className="h-8.5 border border-line-strong bg-paper" aria-label={`Remove ${member.name}`}>
          Remove
        </Button>
      )}
    </li>
  );
}
