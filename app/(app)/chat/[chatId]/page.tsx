import type { Metadata } from "next";
import { ChatScreenContainer } from "@/components/chat/ChatScreenContainer";

// Chats are read on the client after sign-in, so the server can't know the title.
export const metadata: Metadata = { title: "Chat — NeuraOS" };

/** The chat itself; its data is read on the client (ChatScreenContainer). */
export default async function ChatRoute({ params }: PageProps<"/chat/[chatId]">) {
  const { chatId } = await params;
  return (
    <main id="main" className="flex min-h-0 flex-1 flex-col">
      <ChatScreenContainer chatId={chatId} />
    </main>
  );
}
