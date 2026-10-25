import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContributionEditor } from "@/components/account/ContributionEditor";
import { ContributionView } from "@/components/account/ContributionView";
import { myContributions } from "@/lib/fixtures/account";

const find = (id: string) => myContributions.find((c) => c.id === id);

export async function generateMetadata({ params }: PageProps<"/contribute/[id]">): Promise<Metadata> {
  const { id } = await params;
  return { title: `${find(id)?.title ?? "Case study"} — NeuraOS` };
}

/** Drafts and needs-changes open in the editor; the rest are read-only. Static: fixtures; at integration useContribution(id). */
export default async function ContributionPage({ params }: PageProps<"/contribute/[id]">) {
  const { id } = await params;
  const c = find(id);
  if (!c) notFound();
  const editable = c.status === "draft" || c.status === "needs_changes";

  return (
    <main id="main" className="flex min-h-0 flex-1 flex-col">
      {editable ? (
        <ContributionEditor
          key={c.id}
          isNew={false}
          initial={{
            title: c.title,
            specialty: c.specialty,
            type: c.type,
            text: c.text,
            transcript: c.transcript?.draftText ?? (c.type === "voice" ? c.text || null : null),
            reviewNote: c.status === "needs_changes" ? c.reviewNote : null,
          }}
        />
      ) : (
        <ContributionView contribution={c} />
      )}
    </main>
  );
}
