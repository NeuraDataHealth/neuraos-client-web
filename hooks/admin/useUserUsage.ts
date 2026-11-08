"use client";

import { useAdminQuery, type AdminQuery } from "@/hooks/admin/useAdminQuery";
import { api } from "@/lib/api/client";
import type { AdminUserUsageResponse } from "@/lib/contracts/admin";

/** One user's usage today, for the admin user drawer. Refetched when the drawer opens. */
export function useUserUsage(uid: string): AdminQuery<AdminUserUsageResponse> {
  return useAdminQuery(`usage:${uid}`, () => api.admin.userUsage(uid));
}
