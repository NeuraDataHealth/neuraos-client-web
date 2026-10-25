"use client";

import { useRouter } from "next/navigation";
import { Composer } from "@/components/chat/Composer";
import { MAX_UPLOADS_PER_USER_PER_CHAT } from "@/lib/limits";

/**
 * New-chat composer. Static: opens the empty fixture chat. At integration it
 * creates the chat (api.chats.create), sends the message, then opens the chat.
 */
export function HomeComposer() {
  const router = useRouter();
  return (
    <Composer
      placeholder="Describe a case…"
      members={[]}
      mentionsEnabled={false}
      replyTo={null}
      busy={false}
      uploadsRemaining={MAX_UPLOADS_PER_USER_PER_CHAT}
      onSend={() => router.push("/chat/chat_new")}
    />
  );
}
