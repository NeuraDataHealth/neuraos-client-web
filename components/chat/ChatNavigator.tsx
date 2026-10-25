"use client";

import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { CaseFiles } from "@/components/chat/CaseFiles";
import type { ChatGroup } from "@/components/chat/chatGroups";
import { ChatListItem } from "@/components/chat/ChatListItem";
import { Icon } from "@/components/ui/Icon";
import { SearchField } from "@/components/ui/SearchField";
import { Text } from "@/components/ui/Text";
import type { FileDoc } from "@/lib/types";

type ChatNavigatorProps = {
  groups: ChatGroup[];
  /** Files per chat id; the open chat's files show as case files. */
  filesByChat: Record<string, (FileDoc & { id: string })[]>;
};

/** Search, new chat, the open chat's files and the chat list. */
export function ChatNavigator({ groups, filesByChat }: ChatNavigatorProps) {
  const [query, setQuery] = useState("");
  const pathname = usePathname();
  const activeId = pathname.startsWith("/chat/") ? decodeURIComponent(pathname.split("/")[2] ?? "") : null;

  const q = query.trim().toLowerCase();
  const visible = groups
    .map((group) => ({ ...group, chats: group.chats.filter((chat) => chat.title.toLowerCase().includes(q)) }))
    .filter((group) => group.chats.length > 0);

  return (
    <>
      <div className="flex shrink-0 gap-2.5 px-4 pt-1">
        <SearchField
          label="Search chats"
          placeholder="Search cases"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="flex-1"
        />
        <NextLink
          href="/chat"
          aria-label="New chat"
          title="New chat"
          className="flex size-11 shrink-0 items-center justify-center rounded-full bg-linear-to-b from-accent-hi to-accent text-paper shadow-key-accent-sm transition-[filter,translate] duration-(--duration-press) hover:brightness-107 active:translate-y-0.5"
        >
          <Icon name="compose" size={17} />
        </NextLink>
      </div>
      <nav aria-label="Chats" className="flex min-h-0 flex-1 flex-col gap-5.5 overflow-auto px-4 pt-5.5 pb-3">
        {activeId && <CaseFiles files={filesByChat[activeId] ?? []} />}
        {visible.map((group) => (
          <section key={group.label} aria-labelledby={`chats-${group.label}`}>
            <Text as="h2" id={`chats-${group.label}`} variant="badge" className="px-1.5 pb-2 text-muted">
              {group.label}
            </Text>
            <ul className="flex flex-col gap-0.5">
              {group.chats.map((chat) => (
                <ChatListItem key={chat.id} chat={chat} active={chat.id === activeId} />
              ))}
            </ul>
          </section>
        ))}
        {q && visible.length === 0 && (
          <Text variant="caption" className="px-1.5 text-muted">
            No chats match that search.
          </Text>
        )}
      </nav>
    </>
  );
}
