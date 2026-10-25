import type { Metadata } from "next";
import { TopBar } from "@/components/app/TopBar";
import { ChatHome } from "@/components/chat/ChatHome";
import { shortName } from "@/components/chat/messageState";
import { signedInUser } from "@/lib/fixtures/users";

export const metadata: Metadata = { title: "New chat — NeuraOS" };

export default function ChatPage() {
  return (
    <main id="main" className="flex min-h-0 flex-1 flex-col">
      <TopBar title="New chat" />
      <ChatHome name={shortName(signedInUser.name)} />
    </main>
  );
}
