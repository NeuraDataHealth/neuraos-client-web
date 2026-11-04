"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { safeNext } from "@/components/account/safeNext";
import { WelcomeScreen } from "@/components/account/WelcomeScreen";
import { PageStatus } from "@/components/app/PageStatus";
import { shortName } from "@/components/chat/messageState";
import { useProfile } from "@/hooks/account/useProfile";
import { uiPreview } from "@/lib/firebase/preview";
import { signedInUser } from "@/lib/fixtures/users";

/** Client side of /welcome: once the role is saved, continue to ?next= (default /chat). */
export function WelcomeContainer() {
  const profile = useProfile();
  const router = useRouter();
  const done = Boolean(profile.data?.profession);

  useEffect(() => {
    if (done) router.replace(safeNext());
  }, [done, router]);

  if (uiPreview) {
    return <WelcomeScreen firstName={shortName(signedInUser.name)} onSave={async () => router.replace("/chat")} />;
  }
  if (!profile.data || done) {
    return <PageStatus error={profile.error} label={done ? "Opening NeuraOS…" : "Setting up your account…"} />;
  }
  return <WelcomeScreen firstName={shortName(profile.data.name)} onSave={profile.save} />;
}
