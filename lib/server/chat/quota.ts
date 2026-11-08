import "server-only";
import { FieldValue, Timestamp, type DocumentReference } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import { isGroupChat } from "@/lib/chats";
import {
  AI_REPLIES_PER_DAY,
  AI_SLOT_TTL_SECONDS,
  DEFAULT_DAILY_SPEND_CAP_USD,
  GROUP_AI_REPLIES_PER_DAY,
  MESSAGES_PER_MINUTE,
  USER_DAILY_SPEND_CAP_USD,
} from "@/lib/limits";
import { todayKey } from "@/lib/day";
import { ApiError } from "@/lib/server/http/errors";
import { spendToday } from "@/lib/server/spend";
import type { AppConfigDoc, ChatDoc } from "@/lib/types";

type StoredUsage = {
  aiReplies?: number;
  costUsd?: number;
  minuteCount?: number;
  minuteWindowStart?: Timestamp;
};

/** `usage/{uid}_{day}`; `day` defaults to today (IST). */
export function usageRef(uid: string, day: string = todayKey()): DocumentReference {
  return adminDb().doc(`usage/${uid}_${day}`);
}

/** Daily AI replies and the per-user AI spend allowance. */
function checkDailyAi(usage: StoredUsage): void {
  if ((usage.aiReplies ?? 0) >= AI_REPLIES_PER_DAY) throw new ApiError("DAILY_LIMIT");
  if ((usage.costUsd ?? 0) >= USER_DAILY_SPEND_CAP_USD) {
    throw new ApiError("DAILY_LIMIT", "You have used today's AI allowance. Try again tomorrow.");
  }
}

/**
 * Counts one message against the per-minute limit and, when the AI will answer,
 * checks the daily AI-reply limit. One transaction, so parallel sends cannot slip past.
 */
export async function takeMessageQuota(uid: string, needsAi: boolean): Promise<void> {
  const ref = usageRef(uid);
  await adminDb().runTransaction(async (tx) => {
    const usage = ((await tx.get(ref)).data() ?? {}) as StoredUsage;
    const now = Timestamp.now();
    const start = usage.minuteWindowStart;
    const inWindow = start ? now.toMillis() - start.toMillis() < 60_000 : false;
    const count = inWindow ? (usage.minuteCount ?? 0) : 0;

    if (count >= MESSAGES_PER_MINUTE) throw new ApiError("RATE_LIMIT");
    if (needsAi) checkDailyAi(usage);

    tx.set(ref, { minuteWindowStart: inWindow && start ? start : now, minuteCount: count + 1 }, { merge: true });
  });
}

/** Daily AI limits only (retry is not a new message). */
export async function checkDailyAiLimit(uid: string): Promise<void> {
  checkDailyAi(((await usageRef(uid).get()).data() ?? {}) as StoredUsage);
}

/** A finished answer counts toward the daily limit; declines and failures do not. */
export async function countAiReply(uid: string): Promise<void> {
  await usageRef(uid).set({ aiReplies: FieldValue.increment(1) }, { merge: true });
}

/**
 * `config/app.aiEnabled` and today's spend against `dailySpendCapUsd`.
 * Both answer with the capacity message (SPEC.md section 16).
 */
export async function checkAiCapacity(): Promise<void> {
  const config = (await adminDb().doc("config/app").get()).data() as Partial<AppConfigDoc> | undefined;
  if (config?.aiEnabled === false) throw new ApiError("AT_CAPACITY");
  const cap = config?.dailySpendCapUsd ?? DEFAULT_DAILY_SPEND_CAP_USD;
  const spent = await spendToday();
  if (spent.costUsd >= cap) throw new ApiError("AT_CAPACITY");
}

/**
 * One AI reply per user at a time: `aiInFlight[uid] = now + TTL`. An expired entry counts as free.
 * In a group, also counts the reply against GROUP_AI_REPLIES_PER_DAY.
 */
export async function takeAiSlot(chatRef: DocumentReference, uid: string): Promise<void> {
  await adminDb().runTransaction(async (tx) => {
    const snap = await tx.get(chatRef);
    if (!snap.exists) throw new ApiError("NOT_FOUND");
    const chat = snap.data() as ChatDoc;
    if (!chat.memberIds.includes(uid)) throw new ApiError("NOT_MEMBER");

    const slot = chat.aiInFlight?.[uid] as Timestamp | undefined;
    if (slot && slot.toMillis() > Date.now()) throw new ApiError("AI_BUSY");

    const update: Record<string, unknown> = {
      [`aiInFlight.${uid}`]: Timestamp.fromMillis(Date.now() + AI_SLOT_TTL_SECONDS * 1000),
    };
    if (isGroupChat(chat)) {
      const day = todayKey();
      const count = chat.aiReplies?.day === day ? chat.aiReplies.count : 0;
      if (count >= GROUP_AI_REPLIES_PER_DAY) {
        throw new ApiError("DAILY_LIMIT", "This group has reached today's AI limit. Try again tomorrow.");
      }
      update.aiReplies = { day, count: count + 1 };
    }
    tx.update(chatRef, update);
  });
}

export async function releaseAiSlot(chatRef: DocumentReference, uid: string): Promise<void> {
  await chatRef.update({ [`aiInFlight.${uid}`]: FieldValue.delete() }).catch(() => {});
}
