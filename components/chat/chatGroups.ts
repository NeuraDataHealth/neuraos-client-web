import type { ChatDoc } from "@/lib/types";

export type ChatSummary = {
  id: string;
  title: string;
  isGroup: boolean;
};

export type ChatGroup = { label: string; chats: ChatSummary[] };

const DAY = 24 * 60 * 60 * 1000;

/**
 * Sidebar sections by last activity: Today, Yesterday, Earlier (newest first,
 * empty sections dropped). Runs on the server at request time.
 */
export function groupChatsByDay(chats: (ChatDoc & { id: string })[], now = Date.now()): ChatGroup[] {
  const startOfToday = new Date(now).setHours(0, 0, 0, 0);
  const sections: ChatGroup[] = [
    { label: "Today", chats: [] },
    { label: "Yesterday", chats: [] },
    { label: "Earlier", chats: [] },
  ];
  const sorted = [...chats].sort((a, b) => b.lastMessageAt.toMillis() - a.lastMessageAt.toMillis());
  for (const chat of sorted) {
    const at = chat.lastMessageAt.toMillis();
    const section = at >= startOfToday ? 0 : at >= startOfToday - DAY ? 1 : 2;
    sections[section].chats.push({ id: chat.id, title: chat.title, isGroup: chat.memberIds.length > 1 });
  }
  return sections.filter((section) => section.chats.length > 0);
}
