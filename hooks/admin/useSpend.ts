"use client";

import { useAdminQuery } from "@/hooks/admin/useAdminQuery";
import { api } from "@/lib/api/client";
import type { AdminSpendResponse } from "@/lib/contracts/admin";

export type SpendState = {
  data: AdminSpendResponse | null;
  loading: boolean;
  error: Error | null;
  refresh: () => void;
};

/** Today's AI spend across all shards. */
export function useSpend(): SpendState {
  const query = useAdminQuery("spend", () => api.admin.spend());
  return {
    data: query.data,
    loading: query.loading,
    error: query.error,
    refresh: query.refresh,
  };
}
