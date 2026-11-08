"use client";

import { useState } from "react";
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
  onSignIn?: () => Promise<void>;
  onJoin?: () => Promise<void>;
};

/**
 * Join card for /join/[token].
 * Connects with real auth and join handlers when provided, falling back to simulation in preview.
 */
export function JoinScreen({ initialState, group, chatId, account, onSignIn, onJoin }: JoinScreenProps) {
  const [state, setState] = useState<JoinState>(initialState);
  const [busy, setBusy] = useState<"signIn" | "join" | null>(null);

  async function handleSignIn() {
    setBusy("signIn");
    try {
      if (onSignIn) {
        await onSignIn();
      } else {
        await new Promise((r) => setTimeout(r, 900));
        setState("ready");
      }
    } finally {
      setBusy(null);
    }
  }

  async function handleJoin() {
    setBusy("join");
    try {
      if (onJoin) {
        await onJoin();
      } else {
        await new Promise((r) => setTimeout(r, 900));
        setState("joined");
      }
    } finally {
      setBusy(null);
    }
  }

  const showGroup = group && state !== "expired";
  const memberNames =
    state === "joined" && group ? [...group.memberNames, account.name] : (group?.memberNames ?? []);

  return (
    <>
      <div className="mt-1 flex w-full max-w-card flex-col items-center gap-5.5 rounded-sheet-sm border border-ink/8 bg-paper px-7 pt-7 pb-6.5 text-center shadow-sheet">
        {showGroup && <JoinSummary group={{ ...group, memberNames }} />}

        {state === "signedOut" && (
          <div className="flex w-full flex-col gap-3">
            <Button look="app-accent-xl" className="w-full" disabled={busy !== null} onClick={handleSignIn}>
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
            <Button look="app-accent-xl" className="w-full" disabled={busy !== null} onClick={handleJoin}>
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
