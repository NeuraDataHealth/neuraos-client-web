import type { Metadata } from "next";
import { ChatHomeContainer } from "@/components/chat/ChatHomeContainer";

export const metadata: Metadata = { title: "New chat — NeuraOS" };

export default function ChatPage() {
  return <ChatHomeContainer />;
}
