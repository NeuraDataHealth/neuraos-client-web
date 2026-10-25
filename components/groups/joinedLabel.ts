import type { FirestoreTimestamp } from "@/lib/types";

const format = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Asia/Kolkata",
});

/** "Joined 25 Oct, 08:31 am" in India time, the same on server and client. */
export function joinedLabel(joinedAt: FirestoreTimestamp): string {
  return `Joined ${format.format(joinedAt.toDate())}`;
}

/** "Just you so far", "Dr. Aarav Mehta and Dr. Priya Raman", "A, B and C". */
export function memberList(names: string[]): string {
  if (names.length <= 1) return "Just you so far";
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}
