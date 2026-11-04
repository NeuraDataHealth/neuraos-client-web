"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { JoinScreen, type JoinState } from "@/components/groups/JoinScreen";
import { showToast } from "@/components/ui/toastStore";
import { useJoin } from "@/hooks/chat/useJoin";
import { useAuth } from "@/hooks/useAuth";

type JoinContainerProps = {
  token: string;
  forcedState?: JoinState;
};

/**
 * Client container for the join page (/join/[token]).
 * Reads the live invite preview and executes real Google sign-in and join operations.
 */
export function JoinContainer({ token, forcedState }: JoinContainerProps) {
  const router = useRouter();
  const { user, signInWithGoogle } = useAuth();
  const { state: derivedState, preview, join } = useJoin(token, Boolean(user));
  const [joinedChatId, setJoinedChatId] = useState<string | null>(null);

  const state = forcedState ?? (joinedChatId ? "joined" : derivedState);

  async function handleSignIn() {
    try {
      await signInWithGoogle();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Sign-in failed");
    }
  }

  async function handleJoin() {
    try {
      const chatId = await join();
      setJoinedChatId(chatId);
      showToast("Joined group!");
      router.push(`/chat/${chatId}`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to join group");
    }
  }

  const group = preview
    ? {
        title: preview.title,
        inviterName: preview.inviterName,
        inviterLine: preview.inviterLine,
        memberNames: preview.memberNames,
      }
    : null;

  return (
    <JoinScreen
      key={state}
      initialState={state}
      group={group}
      chatId={joinedChatId ?? preview?.chatId ?? null}
      account={{
        name: user?.displayName ?? "Guest",
        email: user?.email ?? "",
      }}
      onSignIn={handleSignIn}
      onJoin={handleJoin}
    />
  );
}
