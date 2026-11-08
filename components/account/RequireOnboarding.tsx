"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { PageStatus } from "@/components/app/PageStatus";
import { useProfile } from "@/hooks/account/useProfile";
import { uiPreview } from "@/lib/firebase/preview";

/**
 * Sends signed-in users who haven't picked their role yet to /welcome?next=<path>.
 * Waits while onboarding creates the user doc on the first sign-in.
 */
export function RequireOnboarding({ children }: { children: ReactNode }) {
  const profile = useProfile();
  const router = useRouter();
  const pathname = usePathname();
  const needsRole = !uiPreview && profile.data !== null && !profile.data.profession;

  useEffect(() => {
    if (!needsRole) return;
    router.replace(`/welcome?next=${encodeURIComponent(`${pathname}${window.location.search}`)}`);
  }, [needsRole, pathname, router]);

  if (uiPreview) return children;
  if (!profile.data || needsRole) {
    return <PageStatus error={profile.error} label={needsRole ? "One quick step…" : "Setting up your account…"} />;
  }
  return children;
}
