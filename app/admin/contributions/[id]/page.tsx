import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContributionReview } from "@/components/admin/ContributionReview";
import { adminApplications, adminContributions, adminUsers } from "@/lib/fixtures/admin";

const find = (id: string) => adminContributions.find((c) => c.id === id);

export async function generateMetadata({ params }: PageProps<"/admin/contributions/[id]">): Promise<Metadata> {
  const { id } = await params;
  return { title: `${find(id)?.title ?? "Contribution"} — NeuraOS admin` };
}

export default async function AdminContributionPage({ params }: PageProps<"/admin/contributions/[id]">) {
  const { id } = await params;
  const contribution = find(id);
  if (!contribution) notFound();
  return (
    <main id="main" className="flex min-h-0 flex-1 flex-col">
      <ContributionReview
        key={contribution.id}
        contribution={contribution}
        contributor={adminUsers.find((u) => u.uid === contribution.contributorUid)}
        registration={adminApplications.find((a) => a.uid === contribution.contributorUid)?.registrationNumber ?? null}
        history={adminContributions.filter((c) => c.contributorUid === contribution.contributorUid)}
        reviewer={adminUsers.find((u) => u.role === "admin")?.name ?? "Admin"}
      />
    </main>
  );
}
