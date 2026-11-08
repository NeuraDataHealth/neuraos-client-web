import type { Metadata } from "next";
import { WelcomeContainer } from "@/components/account/WelcomeContainer";
import { RequireAuth } from "@/components/RequireAuth";
import { AppBrand } from "@/components/ui/AppBrand";
import { DotField } from "@/components/ui/DotField";
import { Glow } from "@/components/ui/Glow";

export const metadata: Metadata = { title: "Welcome — NeuraOS" };

/** Onboarding after the first sign-in (role, department, year), styled like sign-in. */
export default function WelcomePage() {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-(image:--gradient-app) text-ink">
      <DotField focus="high" />
      <Glow className="top-[26%] left-1/2" />
      <header className="relative flex h-nav shrink-0 items-center px-7">
        <AppBrand />
      </header>
      <main id="main" className="relative flex flex-1 flex-col items-center justify-center px-5 pt-4 pb-16">
        <RequireAuth>
          <WelcomeContainer />
        </RequireAuth>
      </main>
    </div>
  );
}
