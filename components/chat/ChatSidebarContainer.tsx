"use client";

import { useParams } from "next/navigation";
import { contributionSummary } from "@/components/account/contributionSummary";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { useContributions } from "@/hooks/account/useContributions";
import { useProfile } from "@/hooks/account/useProfile";
import { useChats } from "@/hooks/chat/useChats";
import { useFiles } from "@/hooks/chat/useFiles";
import { uiPreview } from "@/lib/firebase/preview";
import { myContributions } from "@/lib/fixtures/account";
import { filesByChat } from "@/lib/fixtures/files";
import { signedInUser } from "@/lib/fixtures/users";

/**
 * Client side of the app sidebar: live chats, the open chat's files, profile and case studies.
 * Fixtures only in UI preview mode.
 */
export function ChatSidebarContainer() {
  const params = useParams<{ chatId?: string }>();
  const openChatId = params?.chatId ?? "";
  const profile = useProfile();
  const contributions = useContributions();
  const { chats } = useChats();
  const { files } = useFiles(openChatId);

  return (
    <ChatSidebar
      chats={chats}
      filesByChat={uiPreview ? filesByChat : { [openChatId]: files }}
      contributions={(uiPreview ? myContributions : contributions.data).map(contributionSummary)}
      user={profile.data ?? (uiPreview ? signedInUser : null)}
    />
  );
}
