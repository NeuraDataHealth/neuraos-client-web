import "server-only";
import { FieldValue, type DocumentReference, type Timestamp } from "firebase-admin/firestore";
import type { FeedbackRequest, SendMessageRequest, SendMessageResponse } from "@/lib/contracts/messages";
import { adminDb } from "@/lib/firebase/admin";
import { MAX_RETRIES_PER_MESSAGE, STALE_STREAM_SECONDS } from "@/lib/limits";
import {
  checkAiCapacity,
  checkDailyAiLimit,
  releaseAiSlot,
  takeAiSlot,
  takeMessageQuota,
} from "@/lib/server/chat/quota";
import { runReply } from "@/lib/server/chat/reply";
import { ApiError } from "@/lib/server/http/errors";
import type { AuthUser, LogFields } from "@/lib/server/http/route";
import type { ChatDoc, FileDoc, MessageDoc, ReplyTo, UserDoc } from "@/lib/types";

const REPLY_SNIPPET_CHARS = 100;

async function memberChat(user: AuthUser, chatId: string): Promise<{ ref: DocumentReference; chat: ChatDoc }> {
  const ref = adminDb().collection("chats").doc(chatId);
  const snap = await ref.get();
  if (!snap.exists) throw new ApiError("NOT_FOUND", "Chat not found.");
  const chat = snap.data() as ChatDoc;
  if (!chat.memberIds.includes(user.uid)) throw new ApiError("NOT_MEMBER");
  return { ref, chat };
}

/** Attachments must be ready files this sender uploaded to this chat. */
async function checkAttachments(chatRef: DocumentReference, uid: string, ids: string[]): Promise<string[]> {
  const unique = [...new Set(ids)];
  if (unique.length === 0) return [];
  const snaps = await adminDb().getAll(...unique.map((id) => chatRef.collection("files").doc(id)));
  for (const snap of snaps) {
    const file = snap.data() as FileDoc | undefined;
    if (!file || file.uploaderId !== uid || file.status !== "ready") {
      throw new ApiError("INVALID_REQUEST", "An attached file is missing or not ready yet.");
    }
  }
  return unique;
}

async function buildReplyTo(chatRef: DocumentReference, msgId: string | null): Promise<ReplyTo | null> {
  if (!msgId) return null;
  const snap = await chatRef.collection("messages").doc(msgId).get();
  if (!snap.exists) return null;
  const quoted = snap.data() as MessageDoc;
  return { msgId: snap.id, senderName: quoted.senderName, snippet: quoted.text.slice(0, REPLY_SNIPPET_CHARS) };
}

async function senderNameFor(user: AuthUser): Promise<string> {
  const profile = (await adminDb().doc(`users/${user.uid}`).get()).data() as UserDoc | undefined;
  return profile?.name || user.name || "Doctor";
}

/**
 * POST /api/chats/:id/messages (SPEC.md section 7).
 * The AI answers when mentioned or in a one-member chat. The request stays open
 * until the reply finishes; content reaches clients through Firestore.
 */
export async function sendMessage(
  user: AuthUser,
  chatId: string,
  body: SendMessageRequest,
  log?: LogFields,
): Promise<SendMessageResponse> {
  if (log) log.chatId = chatId;
  const { ref: chatRef, chat } = await memberChat(user, chatId);

  if (body.mentions.some((m) => m.type === "user" && !chat.memberIds.includes(m.uid))) {
    throw new ApiError("INVALID_REQUEST", "You can only mention members of this chat.");
  }
  const [attachmentIds, replyTo, senderName] = await Promise.all([
    checkAttachments(chatRef, user.uid, body.attachmentIds),
    buildReplyTo(chatRef, body.replyToMsgId),
    senderNameFor(user),
  ]);

  // 1. Limits, then the caller's AI slot.
  const needsAi = chat.memberIds.length === 1 || body.mentions.some((m) => m.type === "ai");
  await takeMessageQuota(user.uid, needsAi);
  if (needsAi) {
    await checkAiCapacity();
    await takeAiSlot(chatRef, user.uid);
  }

  let aiMsgRef: DocumentReference | null = null;
  let questionRef: DocumentReference;
  try {
    // 2. The user message.
    const now = FieldValue.serverTimestamp();
    questionRef = chatRef.collection("messages").doc();
    await questionRef.set({
      senderType: "user",
      senderId: user.uid,
      senderName,
      text: body.text,
      mentions: body.mentions,
      replyTo,
      triggeredBy: null,
      attachmentIds,
      citedFileIds: [],
      status: "done",
      createdAt: now,
      updatedAt: now,
    });
    await chatRef.update({ lastMessageAt: now });
    if (!needsAi) return { messageId: questionRef.id, aiMessageId: null };

    // 3. The AI message; "Thinking…" shows while the guardrail runs.
    aiMsgRef = chatRef.collection("messages").doc();
    await aiMsgRef.set({
      senderType: "ai",
      senderId: "ai",
      senderName: "NeuraOS",
      text: "",
      mentions: [],
      replyTo: { msgId: questionRef.id, senderName, snippet: body.text.slice(0, REPLY_SNIPPET_CHARS) },
      triggeredBy: questionRef.id,
      attachmentIds: [],
      citedFileIds: [],
      guardrailLabel: null,
      status: "streaming",
      createdAt: now,
      updatedAt: now,
    });
  } catch (error) {
    if (needsAi) await releaseAiSlot(chatRef, user.uid);
    throw error;
  }

  // 4. Guardrail, context, stream, finish (frees the slot).
  await runReply({ chatRef, aiMsgRef, question: await questionRef.get(), callerUid: user.uid, log });
  return { messageId: questionRef.id, aiMessageId: aiMsgRef.id };
}

function isRetryable(message: MessageDoc): boolean {
  if (message.senderType !== "ai" || !message.triggeredBy) return false;
  if (message.status === "error") return true;
  const updated = (message.updatedAt as unknown as Timestamp | null)?.toMillis() ?? 0;
  return message.status === "streaming" && Date.now() - updated > STALE_STREAM_SECONDS * 1000;
}

/**
 * POST /api/chats/:id/messages/:msgId/retry: re-runs a failed or stale AI reply,
 * guardrail included, under the same daily limit, capacity and slot rules.
 */
export async function retryMessage(
  user: AuthUser,
  chatId: string,
  aiMessageId: string,
  log?: LogFields,
): Promise<{ aiMessageId: string }> {
  if (log) log.chatId = chatId;
  const { ref: chatRef } = await memberChat(user, chatId);
  const aiMsgRef = chatRef.collection("messages").doc(aiMessageId);

  const aiMsg = (await aiMsgRef.get()).data() as MessageDoc | undefined;
  if (!aiMsg) throw new ApiError("NOT_FOUND", "Message not found.");
  if (!isRetryable(aiMsg)) throw new ApiError("NOT_RETRYABLE");
  const question = await chatRef.collection("messages").doc(aiMsg.triggeredBy as string).get();
  if (!question.exists) throw new ApiError("NOT_RETRYABLE");

  await checkDailyAiLimit(user.uid);
  await checkAiCapacity();
  await takeAiSlot(chatRef, user.uid);

  try {
    // Reset in a transaction so two members retrying at once start only one reply.
    await adminDb().runTransaction(async (tx) => {
      const current = (await tx.get(aiMsgRef)).data() as MessageDoc | undefined;
      if (!current || !isRetryable(current)) throw new ApiError("NOT_RETRYABLE");
      if ((current.retryCount ?? 0) >= MAX_RETRIES_PER_MESSAGE) {
        throw new ApiError("NOT_RETRYABLE", "This reply has been retried too often. Ask the question again.");
      }
      tx.update(aiMsgRef, {
        retryCount: FieldValue.increment(1),
        status: "streaming",
        text: "",
        guardrailLabel: null,
        citedFileIds: [],
        updatedAt: FieldValue.serverTimestamp(),
      });
    });
  } catch (error) {
    await releaseAiSlot(chatRef, user.uid);
    throw error;
  }

  await runReply({ chatRef, aiMsgRef, question, callerUid: user.uid, log });
  return { aiMessageId };
}

/** POST /api/chats/:id/messages/:msgId/feedback: thumbs up or down on an AI reply. */
export async function submitFeedback(
  user: AuthUser,
  chatId: string,
  msgId: string,
  body: FeedbackRequest,
): Promise<{ ok: true }> {
  const { ref: chatRef } = await memberChat(user, chatId);
  const message = (await chatRef.collection("messages").doc(msgId).get()).data() as MessageDoc | undefined;
  if (!message || message.senderType !== "ai") throw new ApiError("NOT_FOUND", "Message not found.");

  await adminDb().collection("feedback").add({
    uid: user.uid,
    chatId,
    msgId,
    rating: body.rating,
    reason: body.reason ?? null,
    createdAt: FieldValue.serverTimestamp(),
  });
  return { ok: true };
}
