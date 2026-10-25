"use client";

import { useEffect, useState } from "react";
import { shortName } from "@/components/chat/messageState";
import { AccountRow } from "@/components/groups/AccountRow";
import { JoinOutcome } from "@/components/groups/JoinOutcome";
import { JoinSummary, type JoinGroup } from "@/components/groups/JoinSummary";
import { Button } from "@/components/ui/Button";
import { GoogleMark } from "@/components/ui/GoogleMark";
import { Text } from "@/components/ui/Text";

export type JoinState = "signedOut" | "ready" | "full" | "expired" | "member" | "joined";

type JoinScreenProps = {
  initialState: JoinState;
  /** Null for a dead link (nothing to show). */
  group: JoinGroup | null;
  chatId: string | null;
  account: { name: string; email: string };
};

/**
 * Join card for /join/[token]. Static: sign-in and join resolve after a short
 * delay, as in the design. At integration: useAuth().signInWithGoogle and
 * api.groups.join, with full / expired from the join error codes.
 */
export function JoinScreen({ initialState, group, chatId, account }: JoinScreenProps) {
  const [state, setState] = useState<JoinState>(initialState);
  const [busy, setBusy] = useState<"signIn" | "join" | null>(null);

  useEffect(() => {
    if (!busy) return;
    const id = setTimeout(() => {
      setState(busy === "signIn" ? "ready" : "joined");
      setBusy(null);
    }, 900);
    return () => clearTimeout(id);
  }, [busy]);

  const showGroup = group && state !== "expired";
  const memberNames =
    state === "joined" && group ? [...group.memberNames, account.name] : (group?.memberNames ?? []);

  return (
    <>
      <div className="mt-1 flex w-full max-w-card flex-col items-center gap-5.5 rounded-sheet-sm border border-ink/8 bg-paper px-7 pt-7 pb-6.5 text-center shadow-sheet">
        {showGroup && <JoinSummary group={{ ...group, memberNames }} />}

        {state === "signedOut" && (
          <div className="flex w-full flex-col gap-3">
            <Button look="app-accent-xl" className="w-full" disabled={busy !== null} onClick={() => setBusy("signIn")}>
              <GoogleMark />
              {busy === "signIn" ? "Signing in…" : "Sign in with Google to join"}
            </Button>
            <Text variant="body-sm" className="text-muted">
              Use the Google account you use for NeuraOS.
            </Text>
          </div>
        )}

        {state === "ready" && (
          <div className="flex w-full flex-col gap-3">
            <AccountRow name={account.name} email={account.email} onSwitch={() => setState("signedOut")} />
            <Button look="app-accent-xl" className="w-full" disabled={busy !== null} onClick={() => setBusy("join")}>
              {busy === "join" ? "Joining…" : "Join group"}
            </Button>
          </div>
        )}

        {state === "full" && <JoinOutcome kind="full" ownerShort={group ? shortName(group.inviterName) : "the owner"} />}
        {state === "expired" && <JoinOutcome kind="expired" />}
        {(state === "member" || state === "joined") && chatId && <JoinOutcome kind={state} chatId={chatId} />}
      </div>

      {showGroup && state !== "full" && (
        <Text variant="body-sm" className="mt-5 max-w-100 text-center text-muted text-pretty">
          Don&apos;t post patient names or identifiers. Everyone in the group can see shared files and ask NeuraOS about
          them.
        </Text>
      )}
    </>
  );
}
