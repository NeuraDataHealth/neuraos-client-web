import { AppSidebar } from "@/components/app/AppSidebar";
import { SidebarProvider } from "@/components/app/SidebarProvider";
import { AuthProvider } from "@/components/AuthProvider";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { RequireAuth } from "@/components/RequireAuth";
import { Toast } from "@/components/ui/Toast";
import { contributionSummary } from "@/components/account/contributionSummary";
import { myContributions } from "@/lib/fixtures/account";
import { chats } from "@/lib/fixtures/chats";
import { filesByChat } from "@/lib/fixtures/files";
import { signedInUser } from "@/lib/fixtures/users";

/**
 * Signed-in app shell: sidebar (docked from 900px, overlay below) and the page.
 * Static for now: the sidebar reads fixtures until the chat hooks land.
 */
export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <AuthProvider>
      <RequireAuth>
        <SidebarProvider>
          <div className="flex h-dvh overflow-hidden bg-(image:--gradient-app) text-ink">
            <AppSidebar label="Chats and account">
              <ChatSidebar
                chats={chats}
                filesByChat={filesByChat}
                contributions={myContributions.map(contributionSummary)}
                user={signedInUser}
              />
            </AppSidebar>
            <div className="relative flex min-w-0 flex-1 flex-col">{children}</div>
          </div>
          <Toast />
        </SidebarProvider>
      </RequireAuth>
    </AuthProvider>
  );
}
