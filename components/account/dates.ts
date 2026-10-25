import type { FirestoreTimestamp } from "@/lib/types";

const day = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", timeZone: "Asia/Kolkata" });
const dayTime = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Asia/Kolkata",
});

/** "25 Oct" in India time (same on server and client). */
export const shortDate = (ts: FirestoreTimestamp) => day.format(ts.toDate());

/** "25 Oct, 08:30 am" in India time. */
export const dateTime = (ts: FirestoreTimestamp) => dayTime.format(ts.toDate());

/** "2:22" from seconds. */
export function duration(seconds: number): string {
  const s = Math.max(0, Math.round(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}
