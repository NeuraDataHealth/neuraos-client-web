"use client";

import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { ContributeNavigator, type ContributionSummary } from "@/components/account/ContributeNavigator";
import { ContributeNavigatorWithTab } from "@/components/account/ContributeNavigatorWithTab";
import { ChatNavigator } from "@/components/chat/ChatNavigator";
import type { ChatGroup } from "@/components/chat/chatGroups";
import { AppBrand } from "@/components/ui/AppBrand";
import { StatusPill } from "@/components/ui/StatusPill";
import type { FileDoc } from "@/lib/types";

type SidebarBodyProps = {
  groups: ChatGroup[];
  filesByChat: Record<string, (FileDoc & { id: string })[]>;
  contributions: ContributionSummary[];
};

/** Brand and navigation: case studies on /contribute (train mode), chats everywhere else. */
export function SidebarBody({ groups, filesByChat, contributions }: SidebarBodyProps) {
  const pathname = usePathname();
  const train = pathname.startsWith("/contribute");
  return (
    <>
      <div className="flex h-nav shrink-0 items-center px-5.5">
        <AppBrand badge={train ? <StatusPill tone="blue">Train</StatusPill> : undefined} />
      </div>
      {train ? (
        <Suspense fallback={<ContributeNavigator contributions={contributions} activeTab={null} />}>
          <ContributeNavigatorWithTab contributions={contributions} onList={pathname === "/contribute"} />
        </Suspense>
      ) : (
        <ChatNavigator groups={groups} filesByChat={filesByChat} />
      )}
    </>
  );
}
