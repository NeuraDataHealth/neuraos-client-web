import type { Metadata } from "next";
import { SignInScreen } from "@/components/account/SignInScreen";
import { HexBadgeLoader } from "@/components/scene/HexBadgeLoader";
import { AppBrand } from "@/components/ui/AppBrand";
import { DotField } from "@/components/ui/DotField";
import { Glow } from "@/components/ui/Glow";
import { Text } from "@/components/ui/Text";

export const metadata: Metadata = { title: "Sign in — NeuraOS" };

/** Standalone sign-in, styled like the join page (no design of its own). */
export default function SignInPage() {
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
        <SignInScreen />
        <Text variant="body-sm" className="mt-5 max-w-100 text-center text-muted text-pretty">
          Use your work Google account. Don&apos;t post patient names or identifiers in chats.
        </Text>
      </main>
    </div>
  );
}
