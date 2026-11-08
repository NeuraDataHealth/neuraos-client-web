import "server-only";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { adminBucket, adminDb } from "@/lib/firebase/admin";
import { isGroupChat } from "@/lib/chats";
import {
  GROUP_JOINS_PER_DAY,
  GROUPS_CREATED_PER_DAY,
  INVITE_TTL_DAYS,
  MAX_JOINED_GROUPS,
  MAX_MEMBERS,
  MAX_OWNED_GROUPS,
} from "@/lib/limits";
import type {
  ConvertRequest,
  ConvertResponse,
  InviteResponse,
  JoinPreviewResponse,
  JoinResponse,
  LeaveRequest,
} from "@/lib/contracts/groups";
import { deleteChat, oldest, ownedChats } from "@/lib/server/chat/caps";
import { usageRef } from "@/lib/server/chat/quota";
import { ApiError } from "@/lib/server/http/errors";
import type { AuthUser } from "@/lib/server/http/route";
import type { AppConfigDoc, ChatDoc, ChatMember, FileDoc, UsageDoc, UserDoc } from "@/lib/types";

const ALPHABET = "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** When a new or rotated invite link stops working. */
function inviteExpiry(): Timestamp {
  return Timestamp.fromMillis(Date.now() + INVITE_TTL_DAYS * 24 * 60 * 60 * 1000);
}

function inviteExpired(chat: ChatDoc): boolean {
  const expires = chat.inviteExpiresAt as unknown as Timestamp | null | undefined;
  return Boolean(expires && expires.toMillis() <= Date.now());
}

/**
 * Group caps for `convert`: MAX_OWNED_GROUPS (the oldest is deleted for every member
 * when `replaceOldest` is set, after the client confirms) and GROUPS_CREATED_PER_DAY.
 */
async function takeGroupQuota(uid: string, replaceOldest: boolean): Promise<void> {
  const { groups } = await ownedChats(uid);
  if (groups.length >= MAX_OWNED_GROUPS && !replaceOldest) {
    throw new ApiError(
      "LIMIT_GROUPS",
      `You have ${MAX_OWNED_GROUPS} groups. Making a new one deletes your oldest group for all its members.`,
    );
  }

  const db = adminDb();
  const ref = usageRef(uid);
  await db.runTransaction(async (tx) => {
    const usage = ((await tx.get(ref)).data() ?? {}) as Partial<UsageDoc>;
    if ((usage.groupsCreated ?? 0) >= GROUPS_CREATED_PER_DAY) {
      throw new ApiError("LIMIT_GROUPS", `You can make ${GROUPS_CREATED_PER_DAY} groups a day. Try again tomorrow.`);
    }
    tx.set(ref, { groupsCreated: FieldValue.increment(1) }, { merge: true });
  });

  for (const chat of oldest(groups, groups.length - MAX_OWNED_GROUPS + 1)) await deleteChat(chat.id);
}

/** Generates a 32-character random token for group invites. */
export function generateInviteToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join("");
}

/**
 * POST /api/chats/:id/convert
 *
 * Turns a chat into a group (owner only, groupsEnabled required).
 * If shareHistory is true: keeps this chat, deletes unchecked files, posts system message.
 * If shareHistory is false: forks to a new chat, copies checked files, original chat stays private.
 */
export async function convertChat(
  chatId: string,
  user: AuthUser,
  body: ConvertRequest,
): Promise<ConvertResponse> {
  const db = adminDb();

  const configSnap = await db.doc("config/app").get();
  const config = configSnap.data() as AppConfigDoc | undefined;
  if (!config?.groupsEnabled) {
    throw new ApiError("FEATURE_OFF", "Groups are currently disabled.");
  }

  const chatRef = db.doc(`chats/${chatId}`);
  const chatSnap = await chatRef.get();
  if (!chatSnap.exists) {
    throw new ApiError("NOT_FOUND", "Chat not found.");
  }

  const chat = chatSnap.data() as ChatDoc;
  if (chat.ownerId !== user.uid) {
    throw new ApiError("FORBIDDEN", "Only the owner can convert this chat to a group.");
  }
  if (isGroupChat(chat)) {
    throw new ApiError("INVALID_REQUEST", "This chat is already a group.");
  }

  await takeGroupQuota(user.uid, body.replaceOldestGroup ?? false);

  const ownerName = chat.members[user.uid]?.name ?? user.name ?? "Owner";
  const token = generateInviteToken();

  if (body.shareHistory) {
    // Delete unchecked files
    const filesSnap = await chatRef.collection("files").get();
    const bucket = adminBucket();
    for (const doc of filesSnap.docs) {
      if (!body.fileIds.includes(doc.id)) {
        await bucket.file(`chats/${chatId}/${doc.id}`).delete().catch(() => {});
        await doc.ref.delete().catch(() => {});
      }
    }

    await chatRef.update({
      isGroup: true,
      inviteToken: token,
      inviteActive: true,
      inviteExpiresAt: inviteExpiry(),
      lastMessageAt: FieldValue.serverTimestamp(),
    });

    await chatRef.collection("messages").add({
      senderType: "system",
      senderId: "system",
      senderName: "System",
      text: `${ownerName} made this a group`,
      mentions: [],
      replyTo: null,
      triggeredBy: null,
      attachmentIds: [],
      citedFileIds: [],
      status: "done",
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return { chatId };
  } else {
    // History hidden: fork a new chat
    const newChatRef = db.collection("chats").doc();
    const newChatId = newChatRef.id;

    const ownerMember: ChatMember = chat.members[user.uid] ?? {
      name: user.name ?? "Owner",
      photoUrl: user.picture ?? null,
      role: "owner",
      joinedAt: Timestamp.now(),
    };

    let userCopiedCount = 0;
    const bucket = adminBucket();
    for (const fileId of body.fileIds) {
      const oldFileSnap = await chatRef.collection("files").doc(fileId).get();
      if (oldFileSnap.exists) {
        const oldFile = oldFileSnap.data() as FileDoc;
        if (oldFile.uploaderId === user.uid) {
          userCopiedCount++;
        }
        const newFileRef = newChatRef.collection("files").doc();
        const newFileId = newFileRef.id;

        await bucket
          .file(`chats/${chatId}/${fileId}`)
          .copy(bucket.file(`chats/${newChatId}/${newFileId}`))
          .catch(() => {});

        await newFileRef.set({
          ...oldFile,
          gcsUri: `gs://${bucket.name}/chats/${newChatId}/${newFileId}`,
          createdAt: FieldValue.serverTimestamp(),
        });
      }
    }

    await newChatRef.set({
      ownerId: user.uid,
      title: chat.title,
      createdAt: FieldValue.serverTimestamp(),
      lastMessageAt: FieldValue.serverTimestamp(),
      memberIds: [user.uid],
      members: { [user.uid]: ownerMember },
      inviteToken: token,
      inviteActive: true,
      inviteExpiresAt: inviteExpiry(),
      forkedFrom: chatId,
      aiInFlight: {},
      uploadCounts: { [user.uid]: userCopiedCount },
      isGroup: true,
    });

    await newChatRef.collection("messages").add({
      senderType: "system",
      senderId: "system",
      senderName: "System",
      text: `${ownerName} made this a group. Earlier messages stay private.`,
      mentions: [],
      replyTo: null,
      triggeredBy: null,
      attachmentIds: [],
      citedFileIds: [],
      status: "done",
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return { chatId: newChatId };
  }
}

/**
 * POST /api/chats/:id/invite
 *
 * Creates or rotates the group's invite token (owner only).
 */
export async function createOrRotateInvite(
  chatId: string,
  user: AuthUser,
): Promise<InviteResponse> {
  const db = adminDb();
  const chatRef = db.doc(`chats/${chatId}`);
  const chatSnap = await chatRef.get();

  if (!chatSnap.exists) {
    throw new ApiError("NOT_FOUND", "Chat not found.");
  }

  const chat = chatSnap.data() as ChatDoc;
  if (chat.ownerId !== user.uid) {
    throw new ApiError("FORBIDDEN", "Only the owner can create or rotate invite links.");
  }
  if (!isGroupChat(chat)) {
    throw new ApiError("INVALID_REQUEST", "Make this chat a group first.");
  }

  const token = generateInviteToken();
  await chatRef.update({
    inviteToken: token,
    inviteActive: true,
    inviteExpiresAt: inviteExpiry(),
  });

  return { token };
}

/**
 * DELETE /api/chats/:id/invite
 *
 * Revokes the invite link (owner only).
 */
export async function revokeInvite(chatId: string, user: AuthUser): Promise<{ ok: true }> {
  const db = adminDb();
  const chatRef = db.doc(`chats/${chatId}`);
  const chatSnap = await chatRef.get();

  if (!chatSnap.exists) {
    throw new ApiError("NOT_FOUND", "Chat not found.");
  }

  const chat = chatSnap.data() as ChatDoc;
  if (chat.ownerId !== user.uid) {
    throw new ApiError("FORBIDDEN", "Only the owner can revoke invite links.");
  }

  await chatRef.update({ inviteActive: false });
  return { ok: true };
}

/**
 * GET /api/join/:token
 *
 * Returns preview info for a group invite link.
 */
export async function getJoinPreview(token: string, user: AuthUser): Promise<JoinPreviewResponse> {
  const db = adminDb();
  const snap = await db.collection("chats").where("inviteToken", "==", token).limit(1).get();

  if (snap.empty) {
    throw new ApiError("INVITE_INVALID", "This invite link is invalid or has expired.");
  }

  const chatDoc = snap.docs[0];
  const chat = chatDoc.data() as ChatDoc;
  const isMember = chat.memberIds.includes(user.uid);
  const memberCount = chat.memberIds.length;
  const isFull = memberCount >= MAX_MEMBERS;
  const isActive = Boolean(chat.inviteActive) && !inviteExpired(chat);

  let inviterLine: string | null = null;
  const ownerUserSnap = await db.doc(`users/${chat.ownerId}`).get();
  if (ownerUserSnap.exists) {
    const ownerData = ownerUserSnap.data() as UserDoc;
    inviterLine = ownerData.specialty ?? null;
  }

  return {
    chatId: chatDoc.id,
    title: chat.title,
    inviterName: chat.members[chat.ownerId]?.name ?? "A colleague",
    inviterLine,
    memberNames: chat.memberIds.map((uid) => chat.members[uid]?.name ?? "Member"),
    memberCount,
    maxMembers: MAX_MEMBERS,
    isMember,
    isFull,
    isActive,
  };
}

/**
 * POST /api/join/:token
 *
 * Joins a group through an invite link. Enforces MAX_MEMBERS in a transaction.
 */
export async function joinGroup(token: string, user: AuthUser): Promise<JoinResponse> {
  const db = adminDb();
  let resultingChatId = "";

  const dailyRef = usageRef(user.uid);

  await db.runTransaction(async (tx) => {
    const snap = await tx.get(db.collection("chats").where("inviteToken", "==", token).limit(1));
    if (snap.empty) {
      throw new ApiError("INVITE_INVALID", "This invite link is invalid or has expired.");
    }

    const chatDoc = snap.docs[0];
    const chat = chatDoc.data() as ChatDoc;

    if (!chat.inviteActive) {
      throw new ApiError("INVITE_INVALID", "This invite link is no longer active.");
    }
    if (inviteExpired(chat)) {
      throw new ApiError("INVITE_INVALID", "This invite link has expired. Ask the owner for a new one.");
    }

    resultingChatId = chatDoc.id;

    if (chat.memberIds.includes(user.uid)) {
      return;
    }

    if (chat.memberIds.length >= MAX_MEMBERS) {
      throw new ApiError("GROUP_FULL", "This group is already full.");
    }

    const [mine, usageSnap] = await Promise.all([
      tx.get(db.collection("chats").where("memberIds", "array-contains", user.uid)),
      tx.get(dailyRef),
    ]);
    const joined = mine.docs.filter((d) => {
      const c = d.data() as ChatDoc;
      return c.ownerId !== user.uid && isGroupChat(c);
    }).length;
    if (joined >= MAX_JOINED_GROUPS) {
      throw new ApiError("LIMIT_GROUPS", `You are in ${MAX_JOINED_GROUPS} groups. Leave one to join another.`);
    }
    if ((((usageSnap.data() ?? {}) as Partial<UsageDoc>).groupJoins ?? 0) >= GROUP_JOINS_PER_DAY) {
      throw new ApiError("LIMIT_GROUPS", `You can join ${GROUP_JOINS_PER_DAY} groups a day. Try again tomorrow.`);
    }
    tx.set(dailyRef, { groupJoins: FieldValue.increment(1) }, { merge: true });

    const newMember: ChatMember = {
      name: user.name ?? "Member",
      photoUrl: user.picture ?? null,
      role: "member",
      joinedAt: Timestamp.now(),
    };

    tx.update(chatDoc.ref, {
      memberIds: FieldValue.arrayUnion(user.uid),
      [`members.${user.uid}`]: newMember,
      lastMessageAt: FieldValue.serverTimestamp(),
    });

    const msgRef = chatDoc.ref.collection("messages").doc();
    tx.set(msgRef, {
      senderType: "system",
      senderId: "system",
      senderName: "System",
      text: `${user.name ?? "A new member"} joined the group`,
      mentions: [],
      replyTo: null,
      triggeredBy: null,
      attachmentIds: [],
      citedFileIds: [],
      status: "done",
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
  });

  return { chatId: resultingChatId };
}

/**
 * POST /api/chats/:id/leave
 *
 * Member leaves the group. Cannot be called by the owner.
 */
export async function leaveGroup(
  chatId: string,
  user: AuthUser,
  body: LeaveRequest,
): Promise<{ ok: true }> {
  const db = adminDb();
  const chatRef = db.doc(`chats/${chatId}`);
  const chatSnap = await chatRef.get();

  if (!chatSnap.exists) {
    throw new ApiError("NOT_FOUND", "Chat not found.");
  }

  const chat = chatSnap.data() as ChatDoc;
  if (!chat.memberIds.includes(user.uid)) {
    throw new ApiError("NOT_MEMBER", "You are not a member of this chat.");
  }

  if (chat.ownerId === user.uid) {
    throw new ApiError("OWNER_CANNOT_LEAVE", "The owner cannot leave the group.");
  }

  const memberName = chat.members[user.uid]?.name ?? user.name ?? "A member";

  if (body.deleteMyFiles) {
    const filesSnap = await chatRef.collection("files").where("uploaderId", "==", user.uid).get();
    const bucket = adminBucket();
    for (const doc of filesSnap.docs) {
      await bucket.file(`chats/${chatId}/${doc.id}`).delete().catch(() => {});
      await doc.ref.delete().catch(() => {});
    }
  }

  await chatRef.update({
    memberIds: FieldValue.arrayRemove(user.uid),
    [`members.${user.uid}`]: FieldValue.delete(),
    lastMessageAt: FieldValue.serverTimestamp(),
  });

  await chatRef.collection("messages").add({
    senderType: "system",
    senderId: "system",
    senderName: "System",
    text: `${memberName} left the group`,
    mentions: [],
    replyTo: null,
    triggeredBy: null,
    attachmentIds: [],
    citedFileIds: [],
    status: "done",
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  return { ok: true };
}

/**
 * DELETE /api/chats/:id/members/:uid
 *
 * Owner removes a member from the group.
 */
export async function removeGroupMember(
  chatId: string,
  targetUid: string,
  user: AuthUser,
): Promise<{ ok: true }> {
  const db = adminDb();
  const chatRef = db.doc(`chats/${chatId}`);
  const chatSnap = await chatRef.get();

  if (!chatSnap.exists) {
    throw new ApiError("NOT_FOUND", "Chat not found.");
  }

  const chat = chatSnap.data() as ChatDoc;
  if (chat.ownerId !== user.uid) {
    throw new ApiError("FORBIDDEN", "Only the owner can remove group members.");
  }

  if (targetUid === chat.ownerId) {
    throw new ApiError("FORBIDDEN", "The owner cannot be removed.");
  }

  if (!chat.memberIds.includes(targetUid)) {
    return { ok: true };
  }

  const removedName = chat.members[targetUid]?.name ?? "Member";
  const ownerName = chat.members[user.uid]?.name ?? user.name ?? "The owner";

  await chatRef.update({
    memberIds: FieldValue.arrayRemove(targetUid),
    [`members.${targetUid}`]: FieldValue.delete(),
    lastMessageAt: FieldValue.serverTimestamp(),
  });

  await chatRef.collection("messages").add({
    senderType: "system",
    senderId: "system",
    senderName: "System",
    text: `${ownerName} removed ${removedName}`,
    mentions: [],
    replyTo: null,
    triggeredBy: null,
    attachmentIds: [],
    citedFileIds: [],
    status: "done",
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  return { ok: true };
}
