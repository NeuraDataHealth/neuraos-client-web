"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/Text";
import { useAuth } from "@/hooks/useAuth";

/** Only same-site paths, so ?next= can't send users to another site. */
function safeNext(): string {
  const next = new URLSearchParams(window.location.search).get("next");
  return next?.startsWith("/") && !next.startsWith("//") ? next : "/chat";
}

/** Placeholder sign-in (Ashish replaces it): Google popup, then back to ?next=. */
export function GoogleSignInButton() {
  const { user, signInWithGoogle } = useAuth();
  const router = useRouter();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (user) router.replace(safeNext());
  }, [user, router]);

  return (
    <>
      <Button
        look="dark-lg"
        onClick={() => {
          setFailed(false);
          signInWithGoogle().catch(() => setFailed(true));
        }}
      >
        Continue with Google
      </Button>
      {failed && (
        <Text role="alert" variant="body" className="text-copy">
          Sign-in didn&apos;t finish. Please try again.
        </Text>
      )}
    </>
  );
}
