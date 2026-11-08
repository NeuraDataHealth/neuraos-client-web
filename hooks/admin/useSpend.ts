"use client";

import { useEffect, useState } from "react";
import { useAdminQuery } from "@/hooks/admin/useAdminQuery";
import { api } from "@/lib/api/client";
import type { AdminSpendResponse } from "@/lib/contracts/admin";

export type SpendState = {
  data: AdminSpendResponse | null;
  loading: boolean;
  error: Error | null;
  refresh: () => void;
};

/** Spend changes with every reply, so the card refetches it on its own. */
const SPEND_REFRESH_MS = 60_000;

/** Today's AI spend across all shards, refetched every minute (the last value stays shown meanwhile). */
export function useSpend(): SpendState {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), SPEND_REFRESH_MS);
    return () => clearInterval(id);
  }, []);

  const query = useAdminQuery(`spend:${tick}`, () => api.admin.spend());
  return {
    data: query.data,
    loading: query.loading,
    error: query.error,
    refresh: query.refresh,
  };
}
