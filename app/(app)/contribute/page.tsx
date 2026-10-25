import type { Metadata } from "next";
import { TopBar } from "@/components/app/TopBar";

export const metadata: Metadata = { title: "Contribute — NeuraOS" };

/** Placeholder until U4. */
export default function ContributePage() {
  return (
    <main id="main" className="flex min-h-0 flex-1 flex-col">
      <TopBar title="Contribute" />
    </main>
  );
}
