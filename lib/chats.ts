import type { ChatDoc } from "@/lib/types";

/** A group: converted with `convert`, or (older chats) more than one member or an invite link. */
export function isGroupChat(chat: Pick<ChatDoc, "memberIds" | "inviteToken" | "isGroup">): boolean {
  return chat.isGroup ?? (chat.memberIds.length > 1 || chat.inviteToken !== null);
}

/** Least recently active first (the ones a cap replaces). */
export function oldestFirst<T extends Pick<ChatDoc, "lastMessageAt">>(chats: T[]): T[] {
  const at = (chat: T) => chat.lastMessageAt?.toMillis() ?? 0;
  return [...chats].sort((a, b) => at(a) - at(b));
}
