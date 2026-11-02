import { STALE_STREAM_SECONDS } from "@/lib/limits";
import type { MessageDoc } from "@/lib/types";

/** A `streaming` reply that hasn't been updated for STALE_STREAM_SECONDS is treated as failed (SPEC.md section 7). */
export function isStale(message: MessageDoc, now: number): boolean {
  if (message.status !== "streaming") return false;
  const ms =
    typeof message.updatedAt?.toMillis === "function"
      ? message.updatedAt.toMillis()
      : typeof message.updatedAt === "number"
        ? message.updatedAt
        : 0;
  return now - ms > STALE_STREAM_SECONDS * 1000;
}

/**
 * Which guardrail reply a `blocked` AI message is.
 * Uses guardrailLabel from MessageDoc, falling back to 108/112 content detection.
 */
export function blockedKind(message: MessageDoc): "emergency" | "declined" {
  if (message.guardrailLabel === "emergency") return "emergency";
  if (message.guardrailLabel === "non_medical" || message.guardrailLabel === "injection") return "declined";
  return /\b108\b/.test(message.text) && /\b112\b/.test(message.text) ? "emergency" : "declined";
}

/** "Dr. Priya Raman" → "Dr. Raman"; plain names keep the first name. */
export function shortName(name: string): string {
  const parts = name.split(/\s+/);
  if (/^dr\.?$/i.test(parts[0]) && parts.length > 2) return `${parts[0]} ${parts[parts.length - 1]}`;
  return parts[0] ?? name;
}
