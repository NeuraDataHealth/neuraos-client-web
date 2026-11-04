import "server-only";
import { FieldValue } from "firebase-admin/firestore";
import type { CreateChatRequest, CreateChatResponse } from "@/lib/contracts/chats";
import { adminDb } from "@/lib/firebase/admin";
import { MAX_SOLO_CHATS } from "@/lib/limits";
import { deleteChat, oldest, ownedChats } from "@/lib/server/chat/caps";
import { ApiError } from "@/lib/server/http/errors";
import type { AuthUser } from "@/lib/server/http/route";
import type { ChatDoc, UserDoc } from "@/lib/types";

/**
 * Creates a new solo chat owned by the caller.
 * At MAX_SOLO_CHATS it refuses with LIMIT_CHATS unless `replaceOldest` is set,
 * which deletes the least recently active solo chat first (the client confirms).
 */
export async function createChat(
  user: AuthUser,
  body: CreateChatRequest,
): Promise<CreateChatResponse> {
  const db = adminDb();

  // 1. Solo chat cap
  const { solo } = await ownedChats(user.uid);
  if (solo.length >= MAX_SOLO_CHATS) {
    if (!body.replaceOldest) {
      throw new ApiError(
        "LIMIT_CHATS",
        `You have ${MAX_SOLO_CHATS} chats. Starting a new one deletes your oldest chat.`,
      );
    }
    for (const chat of oldest(solo, solo.length - MAX_SOLO_CHATS + 1)) await deleteChat(chat.id);
  }

  // 2. Fetch user profile name/picture if exists
  const userSnap = await db.doc(`users/${user.uid}`).get();
  const userData = userSnap.exists ? (userSnap.data() as UserDoc) : null;
  const displayName = userData?.name || user.name || "Doctor";
  const photoUrl = user.picture || null;

  // 3. Create chat document
  const now = FieldValue.serverTimestamp();
  const chatRef = db.collection("chats").doc();

  const chatDoc: Omit<ChatDoc, "createdAt" | "lastMessageAt"> & {
    createdAt: FieldValue;
    lastMessageAt: FieldValue;
  } = {
    ownerId: user.uid,
    title: body.title?.trim() || "New chat",
    createdAt: now,
    lastMessageAt: now,
    memberIds: [user.uid],
    members: {
      [user.uid]: {
        name: displayName,
        photoUrl,
        role: "owner",
        joinedAt: now as unknown as ChatDoc["members"][string]["joinedAt"],
      },
    },
    inviteToken: null,
    inviteActive: false,
    forkedFrom: null,
    aiInFlight: {},
    uploadCounts: {},
    isGroup: false,
  };

  await chatRef.set(chatDoc);

  return { chatId: chatRef.id };
}

/**
 * DELETE /api/chats/:id: the owner deletes the chat (solo or group) for every member,
 * with its messages, files and stored objects.
 */
export async function deleteOwnChat(user: AuthUser, chatId: string): Promise<{ ok: true }> {
  const snap = await adminDb().doc(`chats/${chatId}`).get();
  if (!snap.exists) throw new ApiError("NOT_FOUND", "Chat not found.");
  if ((snap.data() as ChatDoc).ownerId !== user.uid) {
    throw new ApiError("FORBIDDEN", "Only the owner can delete this chat.");
  }
  await deleteChat(chatId);
  return { ok: true };
}
