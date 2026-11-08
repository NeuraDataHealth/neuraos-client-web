"use client";

import { useState } from "react";
import { useAdminQuery, type AdminQuery } from "@/hooks/admin/useAdminQuery";
import { api } from "@/lib/api/client";
import type { AdminAuditLog } from "@/lib/contracts/admin";

const PAGE = 100;

export type AuditLogsState = AdminQuery<AdminAuditLog[]> & {
  /** Older entries exist beyond what is loaded. */
  hasMore: boolean;
  /** Load the next 100 older entries. */
  loadMore: () => void;
};

/** Audit entries, newest first: 100 at a time, refetched together so a refresh never leaves gaps. */
export function useAuditLogs(): AuditLogsState {
  const [pages, setPages] = useState(1);
  const query = useAdminQuery(`audit:${pages}`, async () => {
    const items: AdminAuditLog[] = [];
    let cursor: string | undefined;
    for (let page = 0; page < pages; page++) {
      const result = await api.admin.listAuditLogs({ cursor, limit: PAGE });
      items.push(...result.items);
      cursor = result.nextCursor ?? undefined;
      if (!cursor) break;
    }
    return { items, hasMore: cursor !== undefined };
  });
  return {
    data: query.data?.items ?? null,
    loading: query.loading,
    error: query.error,
    refresh: query.refresh,
    hasMore: query.data?.hasMore ?? false,
    loadMore: () => setPages((n) => n + 1),
  };
}
