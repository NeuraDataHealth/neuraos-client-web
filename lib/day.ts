const formatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Kolkata",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/**
 * Today's `yyyymmdd` key in India time, for `usage/{uid}_{day}` and `spend/{day}`.
 * Daily limits and the spend cap reset at midnight IST. Shared by server and client.
 */
export function todayKey(now: Date = new Date()): string {
  return formatter.format(now).replace(/-/g, "");
}
