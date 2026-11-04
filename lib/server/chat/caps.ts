import "server-only";
import { adminBucket, adminDb } from "@/lib/firebase/admin";
import { isGroupChat, oldestFirst } from "@/lib/chats";
import type { ChatDoc, WithId } from "@/lib/types";

/** Every chat the user owns (at most MAX_SOLO_CHATS + MAX_OWNED_GROUPS, so read in full). */
export async function ownedChats(uid: string): Promise<{ solo: WithId<ChatDoc>[]; groups: WithId<ChatDoc>[] }> {
  const snap = await adminDb().collection("chats").where("ownerId", "==", uid).get();
  const chats = snap.docs.map((d) => ({ id: d.id, ...(d.data() as ChatDoc) }));
  return { solo: chats.filter((c) => !isGroupChat(c)), groups: chats.filter(isGroupChat) };
}

/** The `count` least recently active chats. */
export function oldest(chats: WithId<ChatDoc>[], count: number): WithId<ChatDoc>[] {
  return oldestFirst(chats).slice(0, Math.max(0, count));
}

/**
 * Deletes a chat for every member: the doc, its messages, files and pending uploads,
 * and the stored files under `chats/{chatId}/`.
 */
export async function deleteChat(chatId: string): Promise<void> {
  await adminBucket()
    .deleteFiles({ prefix: `chats/${chatId}/` })
    .catch(() => {});
  await adminDb().recursiveDelete(adminDb().doc(`chats/${chatId}`));
}
