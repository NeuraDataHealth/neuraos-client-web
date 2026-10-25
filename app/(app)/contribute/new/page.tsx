import type { Metadata } from "next";
import { TopBar } from "@/components/app/TopBar";
import { ContributeGate } from "@/components/account/ContributeGate";
import { ContributionEditor } from "@/components/account/ContributionEditor";
import { signedInUser } from "@/lib/fixtures/users";

export const metadata: Metadata = { title: "New case study — NeuraOS" };

/** Static: the fixture user. At integration: useProfile() for canContribute and the default specialty. */
export default function NewContributionPage() {
  return (
    <main id="main" className="flex min-h-0 flex-1 flex-col">
      {signedInUser.canContribute ? (
        <ContributionEditor
          isNew
          initial={{
            title: "",
            specialty: signedInUser.specialty ?? "General practice",
            type: "text",
            text: "",
            transcript: null,
            reviewNote: null,
          }}
        />
      ) : (
        <>
          <TopBar title="New case study" />
          <ContributeGate reason="unverified" />
        </>
      )}
    </main>
  );
}
