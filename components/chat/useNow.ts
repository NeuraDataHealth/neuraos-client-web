"use client";

import { useEffect, useState } from "react";

/**
 * Current time, refreshed every `intervalMs`. Null on the server and on the first
 * client render, so time-dependent UI (stale replies) never mismatches on hydration.
 */
export function useNow(intervalMs: number): number | null {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setNow(Date.now());
    const first = setTimeout(tick, 0);
    const id = setInterval(tick, intervalMs);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, [intervalMs]);
  return now;
}
