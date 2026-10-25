import { UserCard } from "@/components/account/UserCard";
import { ChatNavigator } from "@/components/chat/ChatNavigator";
import { groupChatsByDay } from "@/components/chat/chatGroups";
import { AppBrand } from "@/components/ui/AppBrand";
import type { ChatDoc, FileDoc, UserDoc } from "@/lib/types";

type ChatSidebarProps = {
  chats: (ChatDoc & { id: string })[];
  filesByChat: Record<string, (FileDoc & { id: string })[]>;
  user: UserDoc;
};

/** App sidebar: brand, chat navigation and the user card. */
export function ChatSidebar({ chats, filesByChat, user }: ChatSidebarProps) {
  const verified = user.verification.status === "approved";
  return (
    <>
      <div className="flex h-nav shrink-0 items-center px-5.5">
        <AppBrand />
      </div>
      <ChatNavigator groups={groupChatsByDay(chats)} filesByChat={filesByChat} />
      <div className="shrink-0 px-3 pt-3 pb-4">
        <UserCard
          name={user.name}
          subtitle={[user.specialty, verified ? "Verified doctor" : null].filter(Boolean).join(" · ") || user.email}
        />
      </div>
    </>
  );
}
