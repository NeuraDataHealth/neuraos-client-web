import { AuthProvider } from "@/components/AuthProvider";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { RequireAuth } from "@/components/RequireAuth";

/** Signed-in app shell: chat sidebar on the left, the page on the right (stacked on phones). */
export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <AuthProvider>
      <RequireAuth>
        <div className="grid min-h-dvh md:grid-cols-[var(--spacing-sidebar)_minmax(0,1fr)]">
          <aside className="border-b border-line md:border-r md:border-b-0">
            <ChatSidebar />
          </aside>
          <div className="min-w-0">{children}</div>
        </div>
      </RequireAuth>
    </AuthProvider>
  );
}
