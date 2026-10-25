"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import { AccessDenied } from "@/components/admin/AccessDenied";
import { useAuth } from "@/hooks/useAuth";
import { uiPreview } from "@/lib/firebase/preview";

const noop = () => () => {};
const previewDenied = () => uiPreview && new URLSearchParams(window.location.search).has("denied");

/** Hides the admin panel from users without the admin claim. The server check on /api/admin/* is the real protection. */
export function AdminGate({ children }: { children: ReactNode }) {
  const { user, isAdmin } = useAuth();
  const denied = useSyncExternalStore(noop, previewDenied, () => false);
  if (!isAdmin || denied) return <AccessDenied name={user?.displayName ?? null} />;
  return children;
}
