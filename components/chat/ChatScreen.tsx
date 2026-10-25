"use client";

import { useState } from "react";
import { TopBar } from "@/components/app/TopBar";
import { AiMessage } from "@/components/chat/AiMessage";
import { ChatEmpty } from "@/components/chat/ChatEmpty";
import { ChatHeaderActions } from "@/components/chat/ChatHeaderActions";
import { Composer, type ComposerDraft } from "@/components/chat/Composer";
import { FeedbackDialog } from "@/components/chat/FeedbackDialog";
import { localFile, localMessage, snippet, timestampNow } from "@/components/chat/localMessage";
import { MessageList } from "@/components/chat/MessageList";
import { isStale } from "@/components/chat/messageState";
import { OwnMessage } from "@/components/chat/OwnMessage";
import { PeerMessage } from "@/components/chat/PeerMessage";
import { SystemMessage } from "@/components/chat/SystemMessage";
import { useNow } from "@/components/chat/useNow";
import { showToast } from "@/components/ui/toastStore";
import { MAX_MEMBERS, MAX_UPLOADS_PER_USER_PER_CHAT } from "@/lib/limits";
import type { ChatDoc, FeedbackRating, FileDoc, MessageDoc, ReplyTo } from "@/lib/types";

type WithId<T> = T & { id: string };

/** Group dialogs opened from the top bar (rendered in U3). */
type GroupDialog = "make-group" | "invite" | "members";

type ChatScreenProps = {
  chat: WithId<ChatDoc>;
  messages: WithId<MessageDoc>[];
  files: WithId<FileDoc>[];
  currentUid: string;
};

/** One chat: top bar, live message column and composer. Static: sends update local state only. */
export function ChatScreen({ chat, messages: initialMessages, files: initialFiles, currentUid }: ChatScreenProps) {
  const [messages, setMessages] = useState(initialMessages);
  const [files, setFiles] = useState<Record<string, FileDoc>>(() => Object.fromEntries(initialFiles.map((f) => [f.id, f])));
  const [replyTo, setReplyTo] = useState<ReplyTo | null>(null);
  const [ratings, setRatings] = useState<Record<string, FeedbackRating>>({});
  const [feedbackFor, setFeedbackFor] = useState<string | null>(null);
  const [, setGroupDialog] = useState<GroupDialog | null>(null);
  const now = useNow(5000);

  const me = { uid: currentUid, name: chat.members[currentUid]?.name ?? "You" };
  const names = Object.fromEntries(Object.entries(chat.members).map(([uid, m]) => [uid, m.name]));
  const others = chat.memberIds.filter((uid) => uid !== currentUid).map((uid) => ({ uid, name: names[uid] ?? "Member" }));
  const isGroup = chat.memberIds.length > 1;
  const stale = (m: MessageDoc) => now !== null && isStale(m, now);
  const mine = new Set(messages.filter((m) => m.senderId === currentUid).map((m) => m.id));
  const busy = messages.some((m) => m.senderType === "ai" && m.status === "streaming" && !stale(m) && mine.has(m.triggeredBy ?? ""));
  const uploadsRemaining = MAX_UPLOADS_PER_USER_PER_CHAT - (chat.uploadCounts[currentUid] ?? 0);

  function send(draft: ComposerDraft) {
    const added = draft.uploads.map((u) => ({ id: `local-file-${u.key}`, file: localFile(u, me) }));
    setFiles((map) => ({ ...map, ...Object.fromEntries(added.map((a) => [a.id, a.file])) }));
    setMessages((list) => [...list, localMessage(draft, me, replyTo, added.map((a) => a.id))]);
    setReplyTo(null);
  }

  function retry(id: string) {
    setMessages((list) =>
      list.map((m) => (m.id === id ? { ...m, status: "streaming", text: "", updatedAt: timestampNow() } : m)),
    );
  }

  function rate(id: string, rating: FeedbackRating) {
    if (rating === "down") return setFeedbackFor(id);
    setRatings((r) => ({ ...r, [id]: rating }));
    showToast("Thanks for the feedback");
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

      <FeedbackDialog
        open={feedbackFor !== null}
        onClose={() => setFeedbackFor(null)}
        onSubmit={() => {
          if (feedbackFor) setRatings((r) => ({ ...r, [feedbackFor]: "down" }));
          setFeedbackFor(null);
          showToast("Thanks for the feedback");
        }}
      />
    </>
  );
}
