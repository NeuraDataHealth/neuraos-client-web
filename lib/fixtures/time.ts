import type { FirestoreTimestamp } from "@/lib/types";

/** Firestore-like timestamp for fixtures, e.g. at("2026-10-25T09:30:00+05:30"). */
export function at(iso: string): FirestoreTimestamp {
  const ms = Date.parse(iso);
  return {
    seconds: Math.floor(ms / 1000),
    nanoseconds: (ms % 1000) * 1_000_000,
    toDate: () => new Date(ms),
    toMillis: () => ms,
  };
}
