import type { Metadata } from "next";
import { JoinContainer } from "@/components/groups/JoinContainer";
import type { JoinState } from "@/components/groups/JoinScreen";
import { HexBadgeLoader } from "@/components/scene/HexBadgeLoader";
import { AppBrand } from "@/components/ui/AppBrand";
import { DotField } from "@/components/ui/DotField";
import { Glow } from "@/components/ui/Glow";
import { uiPreview } from "@/lib/firebase/preview";

export const metadata: Metadata = { title: "Join group — NeuraOS" };

const states: JoinState[] = ["signedOut", "ready", "full", "expired", "member", "joined"];

/**
 * Invite landing (/join/[token]).
 * In UI preview mode, `?state=` forces a state for design review.
 * In live mode, reads real invite preview and auth via JoinContainer.
 */
export default async function JoinPage({ params, searchParams }: PageProps<"/join/[token]">) {
  const { token } = await params;
  const { state: forced } = await searchParams;
  const forcedState =
    uiPreview && typeof forced === "string" && states.includes(forced as JoinState)
      ? (forced as JoinState)
      : undefined;

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
        <JoinContainer token={token} forcedState={forcedState} />
      </main>
    </div>
  );
}
