"use client";

import { useState } from "react";
import { TopBar } from "@/components/app/TopBar";
import { AiMessage } from "@/components/chat/AiMessage";
import { ChatEmpty } from "@/components/chat/ChatEmpty";
import { isGroupChat } from "@/lib/chats";
import { ChatHeaderActions } from "@/components/chat/ChatHeaderActions";
import { Composer, type ComposerDraft } from "@/components/chat/Composer";
import { FeedbackDialog } from "@/components/chat/FeedbackDialog";
import { localFile, localMessage, snippet, systemMessage, timestampNow } from "@/components/chat/localMessage";
import { MessageList } from "@/components/chat/MessageList";
import { isStale } from "@/components/chat/messageState";
import { OwnMessage } from "@/components/chat/OwnMessage";
import { PeerMessage } from "@/components/chat/PeerMessage";
import { SystemMessage } from "@/components/chat/SystemMessage";
import { useNow } from "@/components/chat/useNow";
import { GroupDialogs, type GroupDialog } from "@/components/groups/GroupDialogs";
import { showToast } from "@/components/ui/toastStore";
import { MAX_MEMBERS, MAX_UPLOADS_PER_USER_PER_CHAT } from "@/lib/limits";
import type { ChatDoc, FeedbackRating, FileDoc, MessageDoc, ReplyTo, WithId } from "@/lib/types";

type ChatScreenProps = {
  chat: WithId<ChatDoc>;
  messages: WithId<MessageDoc>[];
  files: WithId<FileDoc>[];
  currentUid: string;
  onSend?: (draft: ComposerDraft) => Promise<void> | void;
  onRetry?: (id: string) => Promise<void> | void;
  onRate?: (id: string, rating: FeedbackRating, reason?: string | null) => Promise<void> | void;
};

/** One chat: top bar, live message column and composer. */
export function ChatScreen({
  chat: initialChat,
  messages: initialMessages,
  files: initialFiles,
  currentUid,
  onSend,
  onRetry,
  onRate,
}: ChatScreenProps) {
  const [localChat, setLocalChat] = useState(initialChat);
  const [localMessages, setLocalMessages] = useState<WithId<MessageDoc>[]>([]);
  const [localFiles, setLocalFiles] = useState<Record<string, FileDoc>>({});

  const chat = onSend ? initialChat : localChat;
  const messages = onSend ? initialMessages : [...initialMessages, ...localMessages];
  const files = onSend
    ? Object.fromEntries(initialFiles.map((f) => [f.id, f]))
    : { ...Object.fromEntries(initialFiles.map((f) => [f.id, f])), ...localFiles };

  const [replyTo, setReplyTo] = useState<ReplyTo | null>(null);
  const [ratings, setRatings] = useState<Record<string, FeedbackRating>>({});
  const [feedbackFor, setFeedbackFor] = useState<string | null>(null);
  const [groupDialog, setGroupDialog] = useState<GroupDialog | null>(null);
  const now = useNow(5000);

  const me = { uid: currentUid, name: chat.members[currentUid]?.name ?? "You" };
  const names = Object.fromEntries(Object.entries(chat.members).map(([uid, m]) => [uid, m.name]));
  const others = chat.memberIds.filter((uid) => uid !== currentUid).map((uid) => ({ uid, name: names[uid] ?? "Member" }));
  const isGroup = isGroupChat(chat);
  const stale = (m: MessageDoc) => now !== null && isStale(m, now);
  const mine = new Set(messages.filter((m) => m.senderId === currentUid).map((m) => m.id));
  const busy = messages.some((m) => m.senderType === "ai" && m.status === "streaming" && !stale(m) && mine.has(m.triggeredBy ?? ""));
  const uploadsRemaining = MAX_UPLOADS_PER_USER_PER_CHAT - (chat.uploadCounts[currentUid] ?? 0);

  async function send(draft: ComposerDraft) {
    if (onSend) {
      setReplyTo(null);
      await onSend(draft);
      return;
    }
    const added = draft.uploads.map((u) => ({ id: `local-file-${u.key}`, file: localFile(u, me) }));
    setLocalFiles((map) => ({ ...map, ...Object.fromEntries(added.map((a) => [a.id, a.file])) }));
    setLocalMessages((list) => [...list, localMessage(draft, me, replyTo, added.map((a) => a.id))]);
    setReplyTo(null);
  }

  async function retry(id: string) {
    if (onRetry) {
      await onRetry(id);
      return;
    }
    setLocalMessages((list) =>
      list.map((m) => (m.id === id ? { ...m, status: "streaming", text: "", updatedAt: timestampNow() } : m)),
    );
  }

  function rate(id: string, rating: FeedbackRating) {
    if (rating === "down") return setFeedbackFor(id);
    setRatings((r) => ({ ...r, [id]: rating }));
    if (onRate) {
      void onRate(id, rating, null);
    } else {
      showToast("Thanks for the feedback");
    }
  }

  const reply = (m: WithId<MessageDoc>) =>
    setReplyTo({ msgId: m.id, senderName: m.senderType === "ai" ? "NeuraOS" : m.senderName, snippet: snippet(m.text) });

  return (
    <>
      <TopBar
        title={chat.title}
        subtitle={isGroup ? `Group · ${chat.memberIds.length} of ${MAX_MEMBERS} members` : "Private chat"}
      >
        <ChatHeaderActions
          isGroup={isGroup}
          isOwner={chat.ownerId === currentUid}
          memberNames={chat.memberIds.map((uid) => names[uid] ?? "Member")}
          onMakeGroup={() => setGroupDialog("make-group")}
          onMembers={() => setGroupDialog("members")}
          onInvite={() => setGroupDialog("invite")}
        />
      </TopBar>

      {messages.length === 0 ? (
        <ChatEmpty isGroup={isGroup} />
      ) : (
        <MessageList contentKey={`${messages.length}:${messages.at(-1)?.text.length ?? 0}`}>
          {messages.map((m) => {
            if (m.senderType === "system") return <SystemMessage key={m.id} text={m.text} />;
            if (m.senderType === "ai")
              return (
                <AiMessage
                  key={m.id}
                  message={m}
                  stale={stale(m)}
                  showAsker={isGroup}
                  files={files}
                  rating={ratings[m.id] ?? null}
                  onRate={(rating) => rate(m.id, rating)}
                  onRetry={() => retry(m.id)}
                  onReply={() => reply(m)}
                />
              );
            const Row = m.senderId === currentUid ? OwnMessage : PeerMessage;
            return <Row key={m.id} message={m} names={names} files={files} onReply={() => reply(m)} />;
          })}
        </MessageList>
      )}

      <div className="shrink-0 px-4 pb-5 app:px-6 app:pb-7">
        <div className="mx-auto max-w-reading">
          <Composer
            placeholder={isGroup ? "Message the group · @AI to ask NeuraOS" : "Ask about this case…"}
            members={others}
            mentionsEnabled={isGroup}
            replyTo={replyTo}
            onCancelReply={() => setReplyTo(null)}
            busy={busy}
            uploadsRemaining={uploadsRemaining}
            onSend={send}
          />
        </div>
      </div>

      <GroupDialogs
        dialog={groupDialog}
        onDialog={setGroupDialog}
        chat={chat}
        files={Object.entries(files).map(([id, file]) => ({ id, ...file }))}
        currentUid={currentUid}
        onChatChange={setLocalChat}
        onKeepFiles={(keep) => setLocalFiles((map) => Object.fromEntries(Object.entries(map).filter(([id]) => keep.includes(id))))}
        onSystemMessage={(text) => setLocalMessages((list) => [...list, systemMessage(text)])}
      />

      <FeedbackDialog
        open={feedbackFor !== null}
        onClose={() => setFeedbackFor(null)}
        onSubmit={(reason) => {
          if (feedbackFor) {
            setRatings((r) => ({ ...r, [feedbackFor]: "down" }));
            if (onRate) {
              void onRate(feedbackFor, "down", reason);
            } else {
              showToast("Thanks for the feedback");
            }
          }
          setFeedbackFor(null);
        }}
      />
    </>
  );
}
