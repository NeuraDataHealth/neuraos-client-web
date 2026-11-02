"use client";

import { notFound } from "next/navigation";
import { PageStatus } from "@/components/app/PageStatus";
import { ChatScreen } from "@/components/chat/ChatScreen";
import {
  useChat,
  useFeedback,
  useFiles,
  useMessages,
  useRetry,
  useSendMessage,
} from "@/hooks/chat";
import { useAuth } from "@/hooks/useAuth";
import { uiPreview } from "@/lib/firebase/preview";
import { chats as fixtureChats } from "@/lib/fixtures/chats";
import { filesByChat } from "@/lib/fixtures/files";
import { messagesByChat } from "@/lib/fixtures/messages";
import { signedInUser } from "@/lib/fixtures/users";

/** Client side of /chat/[chatId]. Live Firestore hooks + API writes. */
export function ChatScreenContainer({ chatId }: { chatId: string }) {
  const { user } = useAuth();
  const { chat, loading: chatLoading, error: chatError } = useChat(chatId);
  const { messages, loading: messagesLoading, error: messagesError } = useMessages(chatId);
  const { files } = useFiles(chatId);
  const { sendMessage } = useSendMessage(chatId);
  const { retry } = useRetry(chatId);
  const { feedback } = useFeedback(chatId);

  if (uiPreview) {
    const fixtureChat = fixtureChats.find((c) => c.id === chatId);
    if (!fixtureChat) notFound();
    return (
      <ChatScreen
        key={fixtureChat.id}
        chat={fixtureChat}
        messages={messagesByChat[fixtureChat.id] ?? []}
        files={filesByChat[fixtureChat.id] ?? []}
        currentUid={signedInUser.id}
      />
    );
  }

  if (chatLoading || messagesLoading) {
    return <PageStatus label="Loading chat…" />;
  }

  if (chatError || messagesError) {
    return <PageStatus error={chatError || messagesError} />;
  }

  if (!chat) {
    notFound();
  }

  return (
    <ChatScreen
      key={chat.id}
      chat={chat}
      messages={messages}
      files={files}
      currentUid={user?.uid ?? ""}
      onSend={async (draft) => {
        await sendMessage({
          text: draft.text,
          mentions: draft.mentions,
          replyToMsgId: draft.replyToMsgId,
          attachmentIds: draft.attachmentIds,
        });
      }}
      onRetry={async (aiMessageId) => {
        await retry(aiMessageId);
      }}
      onRate={async (aiMessageId, rating, reason) => {
        await feedback(aiMessageId, rating, reason);
      }}
    />
  );
}
