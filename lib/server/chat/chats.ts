import "server-only";
import { FieldValue } from "firebase-admin/firestore";
import type { CreateChatRequest, CreateChatResponse } from "@/lib/contracts/chats";
import { adminDb } from "@/lib/firebase/admin";
import { MAX_CHATS_PER_USER } from "@/lib/limits";
import { ApiError } from "@/lib/server/http/errors";
import type { AuthUser } from "@/lib/server/http/route";
import type { ChatDoc, UserDoc } from "@/lib/types";

/**
 * Creates a new chat owned by the caller.
 * Enforces MAX_CHATS_PER_USER limit.
 */
export async function createChat(
  user: AuthUser,
  body: CreateChatRequest,
): Promise<CreateChatResponse> {
  const db = adminDb();

  // 1. Check max chats limit for this user
  const chatsSnap = await db
    .collection("chats")
    .where("ownerId", "==", user.uid)
    .count()
    .get();

  if (chatsSnap.data().count >= MAX_CHATS_PER_USER) {
    throw new ApiError("LIMIT_CHATS");
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
  };

  await chatRef.set(chatDoc);

  return { chatId: chatRef.id };
}
