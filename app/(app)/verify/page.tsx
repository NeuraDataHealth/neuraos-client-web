import type { Metadata } from "next";
import { VerifyScreen } from "@/components/account/VerifyScreen";
import { uiPreview } from "@/lib/firebase/preview";
import { myApplication } from "@/lib/fixtures/account";
import { signedInUser } from "@/lib/fixtures/users";
import type { ApplicationStatus } from "@/lib/types";

export const metadata: Metadata = { title: "Doctor verification — NeuraOS" };

const previewStatuses: ApplicationStatus[] = ["pending", "needs_info", "rejected"];

const notes: Partial<Record<ApplicationStatus, string>> = {
  needs_info: "The ID proof is cut off at the bottom. Upload the full front side.",
  rejected: "The registration number isn't on the council register.",
};

/**
 * Static: the fixture application. In UI preview, ?state=none|pending|needs_info|rejected
 * shows the other states. At integration: useVerification().
 */
export default async function VerifyPage({ searchParams }: PageProps<"/verify">) {
  const { state } = await searchParams;
  const forced = uiPreview && typeof state === "string" ? state : null;
  const status = previewStatuses.find((s) => s === forced);
  const application =
    forced === "none"
      ? null
      : status
        ? {
            ...myApplication,
            status,
            reviewNote: notes[status] ?? null,
            reviewedAt: status === "pending" ? null : myApplication.reviewedAt,
          }
        : myApplication;

  return (
    <main id="main" className="flex min-h-0 flex-1 flex-col">
      <VerifyScreen
        key={forced ?? "fixture"}
        application={application}
        defaults={{ fullName: signedInUser.name, specialty: signedInUser.specialty ?? "" }}
      />
    </main>
  );
}
