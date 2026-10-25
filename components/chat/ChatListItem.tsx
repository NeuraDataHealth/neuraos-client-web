import { clsx } from "clsx";
import NextLink from "next/link";
import type { ChatSummary } from "@/components/chat/chatGroups";
import { Icon } from "@/components/ui/Icon";
import { Text } from "@/components/ui/Text";

type ChatListItemProps = {
  chat: ChatSummary;
  active: boolean;
};

/** One sidebar row; the open chat is raised on a white card. */
export function ChatListItem({ chat, active }: ChatListItemProps) {
  return (
    <li>
      <Text
        as={NextLink}
        href={`/chat/${chat.id}`}
        aria-current={active ? "page" : undefined}
        variant={active ? "button-sm" : "body"}
        className={clsx(
          "flex h-11 items-center gap-2 rounded-card border px-3.5 transition-colors duration-(--duration-row)",
          active ? "border-ink/8 bg-paper text-ink shadow-row-active" : "border-transparent text-copy hover:text-ink",
        )}
      >
        <span className="min-w-0 truncate">{chat.title}</span>
        {chat.isGroup && (
          <span className="text-faint" title="Group">
            <Icon name="group" size={14} />
            <span className="sr-only">(group)</span>
          </span>
        )}
      </Text>
    </li>
  );
}
