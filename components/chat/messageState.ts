import { STALE_STREAM_SECONDS } from "@/lib/limits";
import type { MessageDoc } from "@/lib/types";

/** A `streaming` reply that hasn't been updated for STALE_STREAM_SECONDS is treated as failed (SPEC.md section 7). */
export function isStale(message: MessageDoc, now: number): boolean {
  return message.status === "streaming" && now - message.updatedAt.toMillis() > STALE_STREAM_SECONDS * 1000;
}

/**
 * Which guardrail reply a `blocked` AI message is. MessageDoc has no label yet,
 * so the emergency reply is recognised by its 108 / 112 numbers; switch to a
 * stored label if one is added to lib/types.ts.
 */
export function blockedKind(message: MessageDoc): "emergency" | "declined" {
  return /\b108\b/.test(message.text) && /\b112\b/.test(message.text) ? "emergency" : "declined";
}

/** "Dr. Priya Raman" → "Dr. Raman"; plain names keep the first name. */
export function shortName(name: string): string {
  const parts = name.split(/\s+/);
  if (/^dr\.?$/i.test(parts[0]) && parts.length > 2) return `${parts[0]} ${parts[parts.length - 1]}`;
  return parts[0] ?? name;
}
