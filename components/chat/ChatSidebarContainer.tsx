"use client";

import { contributionSummary } from "@/components/account/contributionSummary";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { useContributions } from "@/hooks/account/useContributions";
import { useProfile } from "@/hooks/account/useProfile";
import { useChats } from "@/hooks/chat/useChats";
import { uiPreview } from "@/lib/firebase/preview";
import { myContributions } from "@/lib/fixtures/account";
import { chats as fixtureChats } from "@/lib/fixtures/chats";
import { filesByChat } from "@/lib/fixtures/files";
import { signedInUser } from "@/lib/fixtures/users";

/**
 * Client side of the app sidebar: live chats, profile and case studies.
 */
export function ChatSidebarContainer() {
  const profile = useProfile();
  const contributions = useContributions();
  const { chats } = useChats();

  return (
    <ChatSidebar
      chats={uiPreview ? fixtureChats : chats}
      filesByChat={filesByChat}
      contributions={(uiPreview ? myContributions : contributions.data).map(contributionSummary)}
      user={profile.data ?? (uiPreview ? signedInUser : null)}
    />
  );
}
