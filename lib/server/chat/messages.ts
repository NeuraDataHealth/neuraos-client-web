import "server-only";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import type { FeedbackRequest, SendMessageRequest, SendMessageResponse } from "@/lib/contracts/messages";
import { adminDb } from "@/lib/firebase/admin";
import {
  AI_REPLIES_PER_DAY,
  AI_SLOT_TTL_SECONDS,
  CONTEXT_FILE_TOKEN_BUDGET,
  DEFAULT_DAILY_SPEND_CAP_USD,
  HISTORY_MESSAGES_IN_CONTEXT,
  MESSAGES_PER_MINUTE,
  STALE_STREAM_SECONDS,
  STREAM_FLUSH_MS,
} from "@/lib/limits";
import {
  buildSystemPrompt,
  classifyMessage,
  fixedReplies,
  selectFiles,
  streamAnswer,
} from "@/lib/server/ai";
import type { TokenUsage } from "@/lib/server/ai/client";
import { ApiError } from "@/lib/server/http/errors";
import type { AuthUser, LogFields } from "@/lib/server/http/route";
import type {
  ChatDoc,
  FileDoc,
  MessageDoc,
  ReferralDoc,
  ReplyTo,
  UserDoc,
} from "@/lib/types";

function getTodayString(): string {
  return new Date().toISOString().slice(0, 10).replace(/-/g, "");
}

function calculateCostUsd(inputTokens: number, outputTokens: number): number {
  return inputTokens * 0.00000015 + outputTokens * 0.0000006;
}

/**
 * Record token usage and spend shard in spend/{yyyymmdd}/shards/{0..9}
 */
async function recordSpendAndUsage(
  uid: string,
  today: string,
  usage: TokenUsage,
) {
  const db = adminDb();
  const costUsd = calculateCostUsd(usage.inputTokens, usage.outputTokens);
  const shardId = String(Math.floor(Math.random() * 10));

  await Promise.all([
    // 1. Sharded spend counter
    db
      .collection("spend")
      .doc(today)
      .collection("shards")
      .doc(shardId)
      .set(
        {
          costUsd: FieldValue.increment(costUsd),
          inputTokens: FieldValue.increment(usage.inputTokens),
          outputTokens: FieldValue.increment(usage.outputTokens),
        },
        { merge: true },
      ),
    // 2. Increment user's daily AI replies
    db
      .collection("usage")
      .doc(`${uid}_${today}`)
      .set(
        {
          aiReplies: FieldValue.increment(1),
        },
        { merge: true },
      ),
  ]);
}

/**
 * Qualify referral on user's first AI reply
 */
async function qualifyReferralIfEligible(uid: string) {
  const db = adminDb();
  const referralRef = db.doc(`referrals/${uid}`);
  const referralSnap = await referralRef.get();

  if (referralSnap.exists) {
    const data = referralSnap.data() as ReferralDoc;
    if (!data.qualifiedAt) {
      const now = FieldValue.serverTimestamp();
      await referralRef.update({ qualifiedAt: now });
      await db.doc(`users/${data.referrerUid}`).update({
        qualifiedReferralCount: FieldValue.increment(1),
      });
    }
  }
}

/**
 * Helper to build file context and full text up to token budget
 */
async function buildFileContext(
  chatId: string,
  userMessageText: string,
  askerName: string,
): Promise<{ fileBlockText: string; citedFileIds: string[] }> {
  const db = adminDb();
  const filesSnap = await db
    .collection("chats")
    .doc(chatId)
    .collection("files")
    .where("status", "==", "ready")
    .get();

  if (filesSnap.empty) {
    return { fileBlockText: "", citedFileIds: [] };
  }

  const files = filesSnap.docs.map((docSnap) => ({
    id: docSnap.id,
    ...(docSnap.data() as FileDoc),
  }));

  const summaries = files.map((f) => ({
    fileId: f.id,
    fileName: f.fileName,
    uploaderName: f.uploaderName,
    summary: f.summary || "",
  }));

  const totalEstimatedTokens = files.reduce(
    (sum, f) => sum + (f.tokenEstimate || Math.ceil((f.extractedText?.length || 0) / 4)),
    0,
  );

  let filesToInclude = files;

  if (totalEstimatedTokens > CONTEXT_FILE_TOKEN_BUDGET) {
    try {
      const { fileIds } = await selectFiles(userMessageText, askerName, summaries);
      const selectedSet = new Set(fileIds);
      filesToInclude = files.filter((f) => selectedSet.has(f.id));
    } catch {
      // Fallback: keep summaries only or first files
      filesToInclude = [];
    }
  }

  const summaryLines = summaries.map(
    (s, idx) => `File ${idx + 1}: ${s.fileName}, uploaded by ${s.uploaderName}\n  Summary: ${s.summary}`,
  );

  const fullTextBlocks = filesToInclude
    .filter((f) => f.extractedText)
    .map((f) => `<<<FILE_TEXT file="${f.fileName}">>>\n${f.extractedText}\n<<<END_FILE_TEXT>>>`);

  const fileBlockText = [
    "[Shared files in this chat]",
    summaryLines.join("\n"),
    "",
    fullTextBlocks.join("\n\n"),
  ]
    .filter(Boolean)
    .join("\n");

  return {
    fileBlockText,
    citedFileIds: filesToInclude.map((f) => f.id),
  };
}

/**
 * Executes the streaming AI reply pipeline
 */
async function executeAiReply({
  chatId,
  userText,
  askerName,
  callerUid,
  aiMsgId,
  log,
}: {
  chatId: string;
  userText: string;
  askerName: string;
  callerUid: string;
  aiMsgId: string;
  log?: LogFields;
}) {
  const db = adminDb();
  const chatRef = db.collection("chats").doc(chatId);
  const aiMsgRef = chatRef.collection("messages").doc(aiMsgId);
  const today = getTodayString();

  try {
    // 1. Build file context
    const { fileBlockText, citedFileIds } = await buildFileContext(chatId, userText, askerName);

    // 2. Fetch past conversation history (last 30 messages)
    const historySnap = await chatRef
      .collection("messages")
      .orderBy("createdAt", "desc")
      .limit(HISTORY_MESSAGES_IN_CONTEXT)
      .get();

    const historyDocs = historySnap.docs.reverse();
    const historyText = historyDocs
      .filter((d) => d.id !== aiMsgId)
      .map((d) => {
        const msg = d.data() as MessageDoc;
        return `[${msg.senderName}]: ${msg.text}`;
      })
      .join("\n");

    const systemInstruction = buildSystemPrompt(askerName);

    const promptParts = [
      fileBlockText,
      "[Conversation]",
      historyText,
    ].filter(Boolean).join("\n\n");

    // 3. Stream answer from Gemini
    const answerGen = streamAnswer({
      systemInstruction,
      contents: [{ role: "user", parts: [{ text: promptParts }] }],
    });

    let accumulatedText = "";
    let lastFlushTime = Date.now();

    let iter = await answerGen.next();
    while (!iter.done) {
      accumulatedText += iter.value;
      const now = Date.now();
      if (now - lastFlushTime >= STREAM_FLUSH_MS) {
        lastFlushTime = now;
        await aiMsgRef.update({
          text: accumulatedText,
          updatedAt: FieldValue.serverTimestamp(),
        });
      }
      iter = await answerGen.next();
    }

    const usage: TokenUsage = iter.value;

    // 4. Mark AI message as done
    await aiMsgRef.update({
      status: "done",
      text: accumulatedText,
      citedFileIds,
      updatedAt: FieldValue.serverTimestamp(),
    });

    // 5. Spend tracking, token usage & referral qualification
    await recordSpendAndUsage(callerUid, today, usage);
    await qualifyReferralIfEligible(callerUid);

    if (log) {
      log.inputTokens = usage.inputTokens;
      log.outputTokens = usage.outputTokens;
      log.costUsd = calculateCostUsd(usage.inputTokens, usage.outputTokens);
    }
  } catch (error) {
    // Update message status to error so the client shows retry
    await aiMsgRef.update({
      status: "error",
      updatedAt: FieldValue.serverTimestamp(),
    }).catch(() => {});
    throw error;
  } finally {
    // Release the aiInFlight slot
    await chatRef.update({
      [`aiInFlight.${callerUid}`]: FieldValue.delete(),
    }).catch(() => {});
  }
}

/**
 * POST /api/chats/:id/messages
 */
export async function sendMessage(
  user: AuthUser,
  chatId: string,
  body: SendMessageRequest,
  log?: LogFields,
): Promise<SendMessageResponse> {
  const db = adminDb();
  const chatRef = db.collection("chats").doc(chatId);
  const today = getTodayString();
  const now = FieldValue.serverTimestamp();

  // 1. Fetch chat document
  const chatSnap = await chatRef.get();
  if (!chatSnap.exists) {
    throw new ApiError("NOT_FOUND", "Chat not found.");
  }
  const chat = chatSnap.data() as ChatDoc;

  // 2. Membership check
  if (!chat.memberIds.includes(user.uid)) {
    throw new ApiError("NOT_MEMBER");
  }

  // 3. Per-minute rate limit check
  const nowMs = Date.now();
  const usageRef = db.collection("usage").doc(`${user.uid}_${today}`);
  const usageSnap = await usageRef.get();
  const usageData = usageSnap.data();

  const windowStart = usageData?.minuteWindowStart?.toMillis?.() ?? usageData?.minuteWindowStart ?? 0;
  const isWithinMinute = nowMs - windowStart < 60_000;
  const minuteCount = isWithinMinute ? (usageData?.minuteCount ?? 0) : 0;

  if (minuteCount >= MESSAGES_PER_MINUTE) {
    throw new ApiError("RATE_LIMIT");
  }

  // 4. Determine if AI should reply
  const shouldTriggerAi =
    body.mentions.some((m) => m.type === "ai") || chat.memberIds.length === 1;

  // 5. If AI will reply, verify AI limits & spend cap
  if (shouldTriggerAi) {
    const aiRepliesToday = usageData?.aiReplies ?? 0;
    if (aiRepliesToday >= AI_REPLIES_PER_DAY) {
      throw new ApiError("DAILY_LIMIT");
    }

    // Config checks
    const configSnap = await db.doc("config/app").get();
    const config = configSnap.data();
    if (config?.aiEnabled === false) {
      throw new ApiError("FEATURE_OFF", "AI assistant is disabled right now.");
    }

    const dailyCap = config?.dailySpendCapUsd ?? DEFAULT_DAILY_SPEND_CAP_USD;
    const spendSnap = await db.collection("spend").doc(today).collection("shards").get();
    const currentSpend = spendSnap.docs.reduce((sum, d) => sum + (d.data().costUsd || 0), 0);

    if (currentSpend >= dailyCap) {
      throw new ApiError("AT_CAPACITY");
    }

    // Take caller's slot in transaction
    await db.runTransaction(async (tx) => {
      const snap = await tx.get(chatRef);
      if (!snap.exists) throw new ApiError("NOT_FOUND");
      const currentChat = snap.data() as ChatDoc;
      if (!currentChat.memberIds.includes(user.uid)) throw new ApiError("NOT_MEMBER");

      const slot = currentChat.aiInFlight?.[user.uid];
      if (slot) {
        const expiryMs = typeof slot.toMillis === "function" ? slot.toMillis() : (slot as unknown as number);
        if (expiryMs > Date.now()) {
          throw new ApiError("AI_BUSY");
        }
      }

      tx.update(chatRef, {
        [`aiInFlight.${user.uid}`]: Timestamp.fromMillis(Date.now() + AI_SLOT_TTL_SECONDS * 1000),
      });
    });
  }

  // 6. Update minute rate limit counter
  await usageRef.set(
    {
      minuteWindowStart: isWithinMinute ? (usageData?.minuteWindowStart ?? now) : now,
      minuteCount: minuteCount + 1,
    },
    { merge: true },
  );

  // 7. Get sender name from user doc
  const userSnap = await db.doc(`users/${user.uid}`).get();
  const userData = userSnap.exists ? (userSnap.data() as UserDoc) : null;
  const senderName = userData?.name || user.name || "Doctor";

  // 8. Build replyTo if replyToMsgId supplied
  let replyTo: ReplyTo | null = null;
  if (body.replyToMsgId) {
    const replyTargetSnap = await chatRef.collection("messages").doc(body.replyToMsgId).get();
    if (replyTargetSnap.exists) {
      const replyData = replyTargetSnap.data() as MessageDoc;
      replyTo = {
        msgId: replyTargetSnap.id,
        senderName: replyData.senderName,
        snippet: replyData.text.slice(0, 100),
      };
    }
  }

  // 9. Write user message
  const userMsgRef = chatRef.collection("messages").doc();
  const userMessageDoc: MessageDoc = {
    senderType: "user",
    senderId: user.uid,
    senderName,
    text: body.text,
    mentions: body.mentions,
    replyTo,
    triggeredBy: null,
    attachmentIds: body.attachmentIds,
    citedFileIds: [],
    status: "done",
    createdAt: now as unknown as MessageDoc["createdAt"],
    updatedAt: now as unknown as MessageDoc["updatedAt"],
  };

  await userMsgRef.set(userMessageDoc);
  await chatRef.update({ lastMessageAt: now });

  if (!shouldTriggerAi) {
    return { messageId: userMsgRef.id, aiMessageId: null };
  }

  // 10. AI Guardrail pre-check
  let guardrailResult;
  try {
    guardrailResult = await classifyMessage(body.text);
  } catch {
    // If the classifier encounters an issue, fall back to medical so legitimate queries can be answered
    guardrailResult = {
      label: "medical" as const,
      usage: { model: "gemini-3.5-flash-lite", inputTokens: 0, outputTokens: 0 },
    };
  }

  const { label } = guardrailResult;
  if (log) {
    log.guardrailLabel = label;
  }

  // Handle non-medical, emergency, or injection guardrail cases
  if (label !== "medical") {
    const aiMsgRef = chatRef.collection("messages").doc();
    const fixedText = fixedReplies[label as keyof typeof fixedReplies] || fixedReplies.non_medical;

    const blockedAiDoc: MessageDoc = {
      senderType: "ai",
      senderId: "ai",
      senderName: "NeuraOS",
      text: fixedText,
      mentions: [],
      replyTo: {
        msgId: userMsgRef.id,
        senderName,
        snippet: body.text.slice(0, 80),
      },
      triggeredBy: userMsgRef.id,
      attachmentIds: [],
      citedFileIds: [],
      guardrailLabel: label,
      status: "blocked",
      createdAt: now as unknown as MessageDoc["createdAt"],
      updatedAt: now as unknown as MessageDoc["updatedAt"],
    };

    await aiMsgRef.set(blockedAiDoc);
    await chatRef.update({
      lastMessageAt: now,
      [`aiInFlight.${user.uid}`]: FieldValue.delete(),
    });

    return { messageId: userMsgRef.id, aiMessageId: aiMsgRef.id };
  }

  // 11. Create streaming AI message
  const aiMsgRef = chatRef.collection("messages").doc();
  const initialAiDoc: MessageDoc = {
    senderType: "ai",
    senderId: "ai",
    senderName: "NeuraOS",
    text: "",
    mentions: [],
    replyTo: {
      msgId: userMsgRef.id,
      senderName,
      snippet: body.text.slice(0, 80),
    },
    triggeredBy: userMsgRef.id,
    attachmentIds: [],
    citedFileIds: [],
    guardrailLabel: "medical",
    status: "streaming",
    createdAt: now as unknown as MessageDoc["createdAt"],
    updatedAt: now as unknown as MessageDoc["updatedAt"],
  };

  await aiMsgRef.set(initialAiDoc);

  // 12. Run streaming reply pipeline (keeps HTTP request open until finish)
  await executeAiReply({
    chatId,
    userText: body.text,
    askerName: senderName,
    callerUid: user.uid,
    aiMsgId: aiMsgRef.id,
    log,
  });

  return { messageId: userMsgRef.id, aiMessageId: aiMsgRef.id };
}

/**
 * POST /api/chats/:id/messages/:msgId/retry
 */
export async function retryMessage(
  user: AuthUser,
  chatId: string,
  aiMessageId: string,
  log?: LogFields,
): Promise<{ aiMessageId: string }> {
  const db = adminDb();
  const chatRef = db.collection("chats").doc(chatId);
  const today = getTodayString();

  // 1. Verify membership
  const chatSnap = await chatRef.get();
  if (!chatSnap.exists) throw new ApiError("NOT_FOUND", "Chat not found.");
  const chat = chatSnap.data() as ChatDoc;
  if (!chat.memberIds.includes(user.uid)) throw new ApiError("NOT_MEMBER");

  // 2. Verify AI message is retryable
  const aiMsgRef = chatRef.collection("messages").doc(aiMessageId);
  const aiMsgSnap = await aiMsgRef.get();
  if (!aiMsgSnap.exists) throw new ApiError("NOT_FOUND", "AI message not found.");
  const aiMsg = aiMsgSnap.data() as MessageDoc;

  if (aiMsg.senderType !== "ai") {
    throw new ApiError("NOT_RETRYABLE");
  }

  const isError = aiMsg.status === "error";
  const updatedAtMs = aiMsg.updatedAt ? (typeof aiMsg.updatedAt.toMillis === "function" ? aiMsg.updatedAt.toMillis() : aiMsg.updatedAt) : 0;
  const isStale = aiMsg.status === "streaming" && (Date.now() - (updatedAtMs as number) > STALE_STREAM_SECONDS * 1000);

  if (!isError && !isStale) {
    throw new ApiError("NOT_RETRYABLE");
  }

  // 3. Find original user message that triggered this AI reply
  if (!aiMsg.triggeredBy) {
    throw new ApiError("NOT_RETRYABLE");
  }
  const userMsgSnap = await chatRef.collection("messages").doc(aiMsg.triggeredBy).get();
  if (!userMsgSnap.exists) {
    throw new ApiError("NOT_RETRYABLE");
  }
  const userMsg = userMsgSnap.data() as MessageDoc;

  // 4. Check limits and slot
  const configSnap = await db.doc("config/app").get();
  const config = configSnap.data();
  if (config?.aiEnabled === false) {
    throw new ApiError("FEATURE_OFF");
  }

  const dailyCap = config?.dailySpendCapUsd ?? DEFAULT_DAILY_SPEND_CAP_USD;
  const spendSnap = await db.collection("spend").doc(today).collection("shards").get();
  const currentSpend = spendSnap.docs.reduce((sum, d) => sum + (d.data().costUsd || 0), 0);
  if (currentSpend >= dailyCap) {
    throw new ApiError("AT_CAPACITY");
  }

  // Reserve slot
  await db.runTransaction(async (tx) => {
    const snap = await tx.get(chatRef);
    if (!snap.exists) throw new ApiError("NOT_FOUND");
    const currentChat = snap.data() as ChatDoc;
    const slot = currentChat.aiInFlight?.[user.uid];
    if (slot) {
      const expiryMs = typeof slot.toMillis === "function" ? slot.toMillis() : (slot as unknown as number);
      if (expiryMs > Date.now()) {
        throw new ApiError("AI_BUSY");
      }
    }
    tx.update(chatRef, {
      [`aiInFlight.${user.uid}`]: Timestamp.fromMillis(Date.now() + AI_SLOT_TTL_SECONDS * 1000),
    });
  });

  // 5. Reset message to streaming
  await aiMsgRef.update({
    status: "streaming",
    text: "",
    updatedAt: FieldValue.serverTimestamp(),
  });

  // 6. Execute streaming reply
  await executeAiReply({
    chatId,
    userText: userMsg.text,
    askerName: userMsg.senderName,
    callerUid: user.uid,
    aiMsgId: aiMessageId,
    log,
  });

  return { aiMessageId };
}

/**
 * POST /api/chats/:id/messages/:msgId/feedback
 */
export async function submitFeedback(
  user: AuthUser,
  chatId: string,
  msgId: string,
  body: FeedbackRequest,
): Promise<{ ok: true }> {
  const db = adminDb();
  const chatSnap = await db.collection("chats").doc(chatId).get();
  if (!chatSnap.exists) throw new ApiError("NOT_FOUND", "Chat not found.");
  const chat = chatSnap.data() as ChatDoc;

  if (!chat.memberIds.includes(user.uid)) {
    throw new ApiError("NOT_MEMBER");
  }

  const feedbackRef = db.collection("feedback").doc();
  await feedbackRef.set({
    uid: user.uid,
    chatId,
    msgId,
    rating: body.rating,
    reason: body.reason ?? null,
    createdAt: FieldValue.serverTimestamp(),
  });

  return { ok: true };
}
