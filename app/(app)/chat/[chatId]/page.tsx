import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ChatScreen } from "@/components/chat/ChatScreen";
import { chats } from "@/lib/fixtures/chats";
import { filesByChat } from "@/lib/fixtures/files";
import { messagesByChat } from "@/lib/fixtures/messages";
import { signedInUser } from "@/lib/fixtures/users";

const findChat = (id: string) => chats.find((chat) => chat.id === id);

export async function generateMetadata({ params }: PageProps<"/chat/[chatId]">): Promise<Metadata> {
  const { chatId } = await params;
  return { title: `${findChat(chatId)?.title ?? "Chat"} — NeuraOS` };
}

/** Static: reads fixtures. At integration: useChat / useMessages / useFiles in a client container. */
export default async function ChatRoute({ params }: PageProps<"/chat/[chatId]">) {
  const { chatId } = await params;
  const chat = findChat(chatId);
  if (!chat) notFound();

  return (
    <main id="main" className="flex min-h-0 flex-1 flex-col">
      <ChatScreen
        key={chat.id}
        chat={chat}
        messages={messagesByChat[chat.id] ?? []}
        files={filesByChat[chat.id] ?? []}
        currentUid={signedInUser.id}
      />
    </main>
  );
}
