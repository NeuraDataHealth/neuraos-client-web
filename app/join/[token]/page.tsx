import type { Metadata } from "next";
import { JoinScreen, type JoinState } from "@/components/groups/JoinScreen";
import { HexBadgeLoader } from "@/components/scene/HexBadgeLoader";
import { AppBrand } from "@/components/ui/AppBrand";
import { DotField } from "@/components/ui/DotField";
import { Glow } from "@/components/ui/Glow";
import { uiPreview } from "@/lib/firebase/preview";
import { chats } from "@/lib/fixtures/chats";
import { previewJoiner, users } from "@/lib/fixtures/users";
import { MAX_MEMBERS } from "@/lib/limits";

export const metadata: Metadata = { title: "Join group — NeuraOS" };

const states: JoinState[] = ["signedOut", "ready", "full", "expired", "member", "joined"];

/**
 * Invite landing. Static: finds the fixture chat by token; in UI preview mode
 * `?state=` forces a state, as in the design. At integration the group preview
 * and state come from the join API and auth.
 */
export default async function JoinPage({ params, searchParams }: PageProps<"/join/[token]">) {
  const { token } = await params;
  const { state: forced } = await searchParams;
  const chat = chats.find((c) => c.inviteActive && c.inviteToken === token);
  const owner = chat ? users.find((u) => u.id === chat.ownerId) : undefined;

  const derived: JoinState = !chat
    ? "expired"
    : chat.memberIds.includes(previewJoiner.id)
      ? "member"
      : chat.memberIds.length >= MAX_MEMBERS
        ? "full"
        : "ready";
  const preview = uiPreview && typeof forced === "string" && states.includes(forced as JoinState);
  const initialState = preview ? (forced as JoinState) : derived;

  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-(image:--gradient-app) text-ink">
      <DotField focus="high" />
      <Glow className="top-[26%] left-1/2" />
      <header className="relative flex h-nav shrink-0 items-center px-7">
        <AppBrand />
      </header>
      <main id="main" className="relative flex flex-1 flex-col items-center justify-center px-5 pb-16">
        <div className="relative h-42.5 w-60 shrink-0">
          <HexBadgeLoader fill={0.8} />
        </div>
        <JoinScreen
          initialState={initialState}
          group={
            chat
              ? {
                  title: chat.title,
                  inviterName: chat.members[chat.ownerId]?.name ?? "A colleague",
                  inviterLine: owner?.specialty ?? null,
                  memberNames: chat.memberIds.map((uid) => chat.members[uid]?.name ?? "Member"),
                }
              : null
          }
          chatId={chat?.id ?? null}
          account={{ name: previewJoiner.name, email: previewJoiner.email }}
        />
      </main>
    </div>
  );
}
