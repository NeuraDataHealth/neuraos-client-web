import { clsx } from "clsx";
import NextLink from "next/link";
import { contributionTabs, tabOf, type ContributionTab } from "@/components/account/contributionTabs";
import { Icon } from "@/components/ui/Icon";
import { keyClassName } from "@/components/ui/keyStyles";
import { Text } from "@/components/ui/Text";
import type { ContributionStatus } from "@/lib/types";

export type ContributionSummary = { id: string; title: string; status: ContributionStatus; meta: string };

type ContributeNavigatorProps = {
  contributions: ContributionSummary[];
  /** Highlighted tab on /contribute; null elsewhere. */
  activeTab: ContributionTab | null;
};

/** Sidebar in train mode (design "Train NeuraOS"): new case study, tabs with counts, drafts to continue. */
export function ContributeNavigator({ contributions, activeTab }: ContributeNavigatorProps) {
  const toContinue = contributions.filter((c) => c.status === "draft" || c.status === "needs_changes");
  return (
    <>
      <div className="shrink-0 px-4 pt-1">
        <Text as={NextLink} href="/contribute/new" variant="ui-md" className={keyClassName("app-accent-md", "w-full")}>
          <Icon name="plus-sm" size={12} />
          New case study
        </Text>
      </div>
      <nav aria-label="Case studies" className="flex min-h-0 flex-1 flex-col gap-5.5 overflow-auto px-4 pt-5.5 pb-3">
        <section aria-labelledby="case-study-tabs">
          <Text as="h2" id="case-study-tabs" variant="badge" className="px-1.5 pb-2 text-muted">
            Case studies
          </Text>
          <ul className="flex flex-col gap-0.5">
            {contributionTabs.map((tab) => {
              const on = tab.value === activeTab;
              const count = contributions.filter((c) => tabOf(c.status) === tab.value).length;
              return (
                <li key={tab.value}>
                  <Text
                    as={NextLink}
                    href={`/contribute?tab=${tab.value}`}
                    aria-current={on ? "page" : undefined}
                    variant={on ? "button-sm" : "body"}
                    className={clsx(
                      "flex h-11 items-center justify-between gap-2.5 rounded-card border px-3.5",
                      on ? "border-ink/8 bg-paper text-ink shadow-row-active" : "border-transparent text-copy hover:text-ink",
                    )}
                  >
                    {tab.label}
                    <Text as="span" variant="mono-sm" className={on ? "text-accent" : "text-faint"}>
                      {count}
                    </Text>
                  </Text>
                </li>
              );
            })}
          </ul>
        </section>
        {toContinue.length > 0 && (
          <section aria-labelledby="continue-draft">
            <Text as="h2" id="continue-draft" variant="badge" className="px-1.5 pb-2 text-muted">
              Continue a draft
            </Text>
            <ul className="flex flex-col gap-0.5">
              {toContinue.map((c) => (
                <li key={c.id}>
                  <NextLink href={`/contribute/${c.id}`} className="flex flex-col gap-1 rounded-card px-3.5 py-2.5 hover:bg-ink/4">
                    <Text as="span" variant="body" className="text-copy">
                      {c.title}
                    </Text>
                    <Text as="span" variant="mono-meta" className="text-faint">
                      {c.meta}
                    </Text>
                  </NextLink>
                </li>
              ))}
            </ul>
          </section>
        )}
      </nav>
    </>
  );
}
