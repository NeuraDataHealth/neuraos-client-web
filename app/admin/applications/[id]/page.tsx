import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ApplicationReview } from "@/components/admin/ApplicationReview";
import { adminApplications, adminUsers } from "@/lib/fixtures/admin";

const find = (id: string) => adminApplications.find((a) => a.id === id);

export async function generateMetadata({ params }: PageProps<"/admin/applications/[id]">): Promise<Metadata> {
  const { id } = await params;
  return { title: `${find(id)?.fullName ?? "Application"} — NeuraOS admin` };
}

export default async function AdminApplicationPage({ params }: PageProps<"/admin/applications/[id]">) {
  const { id } = await params;
  const application = find(id);
  if (!application) notFound();
  const reviewer = adminUsers.find((u) => u.role === "admin")?.name ?? "Admin";
  return (
    <main id="main" className="flex min-h-0 flex-1 flex-col">
      <ApplicationReview
        key={application.id}
        application={application}
        email={adminUsers.find((u) => u.uid === application.uid)?.email ?? "—"}
        reviewer={reviewer}
      />
    </main>
  );
}
