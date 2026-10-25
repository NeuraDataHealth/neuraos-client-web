import { AvatarStack } from "@/components/ui/AvatarStack";
import { Text } from "@/components/ui/Text";
import { MAX_MEMBERS } from "@/lib/limits";

export type JoinGroup = {
  title: string;
  inviterName: string;
  /** e.g. "Cardiology". */
  inviterLine: string | null;
  memberNames: string[];
};

/** Group invite header on the join card: title, who invited you, members. */
export function JoinSummary({ group }: { group: JoinGroup }) {
  return (
    <div className="flex flex-col items-center gap-2.5">
      <Text as="p" variant="badge" className="text-muted">
        Group invite
      </Text>
      <Text as="h1" variant="status-title" className="text-balance">
        {group.title}
      </Text>
      <Text variant="body" className="text-ink-soft">
        {group.inviterName} invited you
        {group.inviterLine && (
          <>
            <br />
            <span className="text-muted">{group.inviterLine}</span>
          </>
        )}
      </Text>
      <div className="mt-1.5 flex items-center gap-2.5">
        <AvatarStack names={group.memberNames} size="md" />
        <Text as="span" variant="mono-sm" className="text-muted">
          {group.memberNames.length} of {MAX_MEMBERS} members
        </Text>
      </div>
    </div>
  );
}
