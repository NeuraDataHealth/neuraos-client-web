import NextLink from "next/link";
import { Icon } from "@/components/ui/Icon";
import { IconTile } from "@/components/ui/IconTile";
import { keyClassName, keyTextVariant } from "@/components/ui/keyStyles";
import { Notice } from "@/components/ui/Notice";
import { Text } from "@/components/ui/Text";
import { MAX_MEMBERS } from "@/lib/limits";

type JoinOutcomeProps =
  | { kind: "full"; ownerShort: string }
  | { kind: "expired" }
  | { kind: "member" | "joined"; chatId: string };

const fullWidth = "w-full";

/** End states of the join card: group full, dead link, or you're in. */
export function JoinOutcome(props: JoinOutcomeProps) {
  if (props.kind === "member" || props.kind === "joined") {
    return (
      <div className="flex w-full flex-col gap-3.5">
        <Text as="p" role="status" variant="item-title" className="flex items-center justify-center gap-2">
          <span className="flex size-5.5 items-center justify-center rounded-full bg-linear-to-b from-accent-hi to-accent text-paper">
            <Icon name="check" size={11} />
          </span>
          {props.kind === "joined" ? "You joined the group" : "You're already in this group"}
        </Text>
        <Text
          as={NextLink}
          href={`/chat/${props.chatId}`}
          variant={keyTextVariant("app-accent-xl")}
          className={keyClassName("app-accent-xl", fullWidth)}
        >
          Open chat
          <Icon name="arrow-right" size={14} />
        </Text>
      </div>
    );
  }

  const home = (
    <Text as={NextLink} href="/chat" variant="ui-lg" className={keyClassName("app-light-lg", fullWidth)}>
      Go to NeuraOS
    </Text>
  );

  if (props.kind === "full") {
    return (
      <div className="flex w-full flex-col gap-3.5 text-left">
        <Notice tone="info">
          <span className="font-medium text-ink">This group is full.</span> Groups can have up to {MAX_MEMBERS} people.
          Ask {props.ownerShort} to make room, then open the link again.
        </Notice>
        {home}
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col items-center gap-3.5">
      <IconTile icon="link-off" size="md" />
      <Text as="h1" variant="status-title" className="text-balance">
        This invite link doesn&apos;t work
      </Text>
      <Text variant="body" className="max-w-80 text-muted text-pretty">
        It has expired or been turned off. Ask the person who invited you for a new link.
      </Text>
      <div className="mt-1.5 w-full">{home}</div>
    </div>
  );
}
