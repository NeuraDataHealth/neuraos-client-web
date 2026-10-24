"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { Text } from "@/components/ui/Text";
import { useAuth } from "@/hooks/useAuth";

/** Sends signed-out users to /sign-in?next=<current path>; renders children once signed in. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading || user) return;
    const next = `${pathname}${window.location.search}`;
    router.replace(`/sign-in?next=${encodeURIComponent(next)}`);
  }, [loading, user, pathname, router]);

  if (!user) {
    return (
      <Text role="status" variant="body" className="p-gutter text-muted">
        {loading ? "Loading…" : "Redirecting to sign in…"}
      </Text>
    );
  }
  return children;
}
