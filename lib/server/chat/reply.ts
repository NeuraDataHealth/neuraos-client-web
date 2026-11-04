import "server-only";
import { FieldValue, type DocumentReference, type DocumentSnapshot } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import { STREAM_FLUSH_MS } from "@/lib/limits";
import type { TokenUsage } from "@/lib/server/ai/client";
import { classifyMessage } from "@/lib/server/ai/guardrail";
import { buildSystemPrompt, fixedReplies } from "@/lib/server/ai/prompt";
import { streamAnswer } from "@/lib/server/ai/answer";
import { buildReplyContext, citedFiles } from "@/lib/server/chat/context";
import { countAiReply, releaseAiSlot } from "@/lib/server/chat/quota";
import type { LogFields } from "@/lib/server/http/route";
import { recordSpend } from "@/lib/server/spend";
import type { MessageDoc, ReferralDoc } from "@/lib/types";

type ReplyJob = {
  chatRef: DocumentReference;
  /** The AI message, already written with `status: streaming` and empty text. */
  aiMsgRef: DocumentReference;
  /** The user message being answered. */
  question: DocumentSnapshot;
  /** Who holds the AI slot and pays the daily limit (the sender, or whoever retries). */
  callerUid: string;
  log?: LogFields;
};

/**
 * One AI reply (SPEC.md section 7, steps 4–9), shared by send and retry:
 * guardrail → fixed notice, or context → stream → done.
 * Fails closed: if the guardrail call fails, the message turns to `error` (Retry)
 * and is never answered unchecked. Always records spend and frees the caller's slot.
 */
export async function runReply({ chatRef, aiMsgRef, question, callerUid, log }: ReplyJob): Promise<void> {
  const usages: TokenUsage[] = [];
  try {
    const message = question.data() as MessageDoc;

    const guardrail = await classifyMessage(message.text);
    usages.push(guardrail.usage);
    if (log) log.guardrailLabel = guardrail.label;

    if (guardrail.label !== "medical") {
      await aiMsgRef.update({
        status: "blocked",
        text: fixedReplies[guardrail.label],
        guardrailLabel: guardrail.label,
        updatedAt: FieldValue.serverTimestamp(),
      });
      return;
    }

    const context = await buildReplyContext(chatRef, question);
    usages.push(...context.usages);

    const stream = streamAnswer({
      systemInstruction: buildSystemPrompt(message.senderName),
      contents: [{ role: "user", parts: [{ text: context.prompt }] }],
    });

    let text = "";
    let flushedAt = Date.now();
    let step = await stream.next();
    while (!step.done) {
      text += step.value;
      if (Date.now() - flushedAt >= STREAM_FLUSH_MS) {
        flushedAt = Date.now();
        await aiMsgRef.update({ text, updatedAt: FieldValue.serverTimestamp() });
      }
      step = await stream.next();
    }
    usages.push(step.value);
    if (log) {
      log.model = step.value.model;
      log.inputTokens = step.value.inputTokens;
      log.outputTokens = step.value.outputTokens;
    }

    // Nothing came back (for example a safety block): show Retry rather than an empty answer.
    if (!text.trim()) throw new Error("The model returned an empty answer");

    await aiMsgRef.update({
      status: "done",
      text,
      guardrailLabel: "medical",
      citedFileIds: citedFiles(text, context.files),
      updatedAt: FieldValue.serverTimestamp(),
    });
    await countAiReply(callerUid);
    await qualifyReferral(callerUid);
  } catch (error) {
    await aiMsgRef.update({ status: "error", updatedAt: FieldValue.serverTimestamp() }).catch(() => {});
    throw error;
  } finally {
    await releaseAiSlot(chatRef, callerUid);
    const cost = await recordSpend(usages, callerUid).catch(() => 0);
    if (log) log.costUsd = cost;
  }
}

/** First AI reply for a referred user: set `qualifiedAt` and count it for the referrer, once. */
async function qualifyReferral(uid: string): Promise<void> {
  const db = adminDb();
  const ref = db.doc(`referrals/${uid}`);
  await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const referral = snap.data() as ReferralDoc | undefined;
    if (!referral || referral.qualifiedAt) return;
    tx.update(ref, { qualifiedAt: FieldValue.serverTimestamp() });
    tx.update(db.doc(`users/${referral.referrerUid}`), { qualifiedReferralCount: FieldValue.increment(1) });
  });
}
