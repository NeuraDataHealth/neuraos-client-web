import type { Metadata } from "next";
import NextLink from "next/link";
import { TopBar } from "@/components/app/TopBar";
import { ContributeGate } from "@/components/account/ContributeGate";
import { ContributionCard } from "@/components/account/ContributionCard";
import { contributionSummary } from "@/components/account/contributionSummary";
import { contributionTabs, isContributionTab, tabOf, type ContributionTab } from "@/components/account/contributionTabs";
import { ContributionTabsControl } from "@/components/account/ContributionTabsControl";
import { Icon } from "@/components/ui/Icon";
import { keyClassName, keyTextVariant } from "@/components/ui/keyStyles";
import { Text } from "@/components/ui/Text";
import { uiPreview } from "@/lib/firebase/preview";
import { myContributions } from "@/lib/fixtures/account";
import { adminConfig } from "@/lib/fixtures/admin";
import { signedInUser } from "@/lib/fixtures/users";

export const metadata: Metadata = { title: "Case studies — NeuraOS" };

/**
 * Static: fixture contributions. UI preview: ?state=unverified|paused shows the gates.
 * At integration: useContributions() and useConfig().
 */
export default async function ContributePage({ searchParams }: PageProps<"/contribute">) {
  const { tab: tabParam, state } = await searchParams;
  const tab: ContributionTab = isContributionTab(tabParam) ? tabParam : "review";
  const gate =
    (uiPreview && (state === "unverified" || state === "paused") && state) ||
    (!signedInUser.canContribute ? "unverified" : !adminConfig.contributionsEnabled ? "paused" : null);

  const summaries = myContributions.map(contributionSummary);
  const counts = Object.fromEntries(
    contributionTabs.map((t) => [t.value, summaries.filter((c) => tabOf(c.status) === t.value).length]),
  ) as Record<ContributionTab, number>;
  const visible = summaries.filter((c) => tabOf(c.status) === tab);

  return (
    <main id="main" className="flex min-h-0 flex-1 flex-col">
      <TopBar title="Case studies" subtitle="Train NeuraOS">
        {!gate && (
          <Text
            as={NextLink}
            href="/contribute/new"
            variant={keyTextVariant("app-accent-sm")}
            className={keyClassName("app-accent-sm")}
          >
            <Icon name="plus-sm" size={12} />
            <span className="max-sm:sr-only">New case study</span>
          </Text>
        )}
      </TopBar>
      <div className="min-h-0 flex-1 overflow-auto px-4 pt-2 pb-14 app:px-6">
        <div className="mx-auto flex max-w-cases flex-col gap-5">
          {gate ? (
            <ContributeGate reason={gate} />
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
                <ContributionTabsControl value={tab} counts={counts} />
                <Text variant="caption" className="text-muted">
                  NeuraOS reviews every case before it is used for training.
                </Text>
              </div>
              {visible.length > 0 ? (
                <ul className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,18.75rem),1fr))] gap-3.5">
                  {visible.map((c) => (
                    <ContributionCard key={c.id} contribution={c} />
                  ))}
                </ul>
              ) : (
                <Text variant="body" className="py-12 text-center text-muted">
                  Nothing here yet.
                </Text>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
}
