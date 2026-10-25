import type { Metadata } from "next";
import { TopBar } from "@/components/app/TopBar";

export const metadata: Metadata = { title: "Doctor verification — NeuraOS" };

/** Placeholder until U4. */
export default function VerifyPage() {
  return (
    <main id="main" className="flex min-h-0 flex-1 flex-col">
      <TopBar title="Doctor verification" />
    </main>
  );
}
