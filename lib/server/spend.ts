import "server-only";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import type { TokenUsage } from "@/lib/server/ai/client";
import { costUsd } from "@/lib/server/ai/pricing";
import { todayKey } from "@/lib/server/day";
import type { SpendShardDoc } from "@/lib/types";

const SHARDS = 10;

/**
 * Adds the cost of every AI call to a random shard of `spend/{today}` (SPEC.md section 5).
 * Called for answers, the guardrail, file extraction and selection, PII checks and transcription.
 * Returns the cost added, for the request log.
 */
export async function recordSpend(usages: TokenUsage[]): Promise<number> {
  const counted = usages.filter((u) => u.inputTokens > 0 || u.outputTokens > 0);
  if (counted.length === 0) return 0;

  const totals = counted.reduce(
    (sum, u) => ({
      costUsd: sum.costUsd + costUsd(u),
      inputTokens: sum.inputTokens + u.inputTokens,
      outputTokens: sum.outputTokens + u.outputTokens,
    }),
    { costUsd: 0, inputTokens: 0, outputTokens: 0 },
  );

  const shard = String(Math.floor(Math.random() * SHARDS));
  await adminDb()
    .doc(`spend/${todayKey()}/shards/${shard}`)
    .set(
      {
        costUsd: FieldValue.increment(totals.costUsd),
        inputTokens: FieldValue.increment(totals.inputTokens),
        outputTokens: FieldValue.increment(totals.outputTokens),
      },
      { merge: true },
    );
  return totals.costUsd;
}

/** Sum of today's spend shards. */
export async function spendToday(day: string = todayKey()): Promise<SpendShardDoc> {
  const snap = await adminDb().collection(`spend/${day}/shards`).get();
  return snap.docs.reduce<SpendShardDoc>(
    (sum, doc) => {
      const data = doc.data() as Partial<SpendShardDoc>;
      return {
        costUsd: sum.costUsd + (data.costUsd ?? 0),
        inputTokens: sum.inputTokens + (data.inputTokens ?? 0),
        outputTokens: sum.outputTokens + (data.outputTokens ?? 0),
      };
    },
    { costUsd: 0, inputTokens: 0, outputTokens: 0 },
  );
}
