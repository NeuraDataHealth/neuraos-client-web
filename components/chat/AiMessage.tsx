import { AiErrorNotice } from "@/components/chat/AiErrorNotice";
import { AttachmentChips } from "@/components/chat/AttachmentChips";
import { DeclinedNotice } from "@/components/chat/DeclinedNotice";
import { EmergencyNotice } from "@/components/chat/EmergencyNotice";
import { FeedbackButtons } from "@/components/chat/FeedbackButtons";
import { blockedKind, shortName } from "@/components/chat/messageState";
import { ReplyButton } from "@/components/chat/ReplyButton";
import { LogoMark } from "@/components/ui/LogoMark";
import { Spinner } from "@/components/ui/Spinner";
import { Text } from "@/components/ui/Text";
import type { FeedbackRating, FileDoc, MessageDoc } from "@/lib/types";

type AiMessageProps = {
  message: MessageDoc;
  /** Streaming but silent for too long: shown as failed. */
  stale: boolean;
  /** Show "Answering Dr. X" (group chats). */
  showAsker: boolean;
  files: Record<string, FileDoc>;
  rating: FeedbackRating | null;
  onRate: (rating: FeedbackRating) => void;
  onRetry: () => void;
  onReply: () => void;
};

/** NeuraOS reply: streaming text, a finished answer with citations, a guardrail reply or a failure. */
export function AiMessage({ message, stale, showAsker, files, rating, onRate, onRetry, onReply }: AiMessageProps) {
  const failed = message.status === "error" || stale;
  const streaming = message.status === "streaming" && !stale;
  const asker = message.replyTo?.senderName;

  return (
    <li className="group flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <LogoMark className="size-5 text-ink" />
        <Text
          as="span"
          variant="mono-sm"
          className="inline-flex h-6.5 items-center rounded-full border border-accent/28 bg-accent/8 px-2.5 text-accent"
        >
          {showAsker && asker ? `Answering ${shortName(asker)}` : "NeuraOS"}
        </Text>
      </div>

      {message.status === "blocked" &&
        (blockedKind(message) === "emergency" ? (
          <EmergencyNotice text={message.text} />
        ) : (
          <DeclinedNotice text={message.text} />
        ))}

      {(message.status === "done" || message.status === "streaming" || failed) && message.text && (
        <Text as="div" variant="message-ai" className="whitespace-pre-wrap text-ink-soft text-pretty">
          {message.text}
          {streaming && (
            <span
              aria-hidden="true"
              className="ml-0.75 inline-block h-3.75 w-2 animate-blink rounded-xs bg-accent align-[-2px] motion-reduce:animate-none"
            />
          )}
        </Text>
      )}

      {streaming && !message.text && (
        <Text variant="body" className="flex items-center gap-2 text-muted">
          <Spinner />
          Thinking…
        </Text>
      )}
      {streaming && <span className="sr-only" role="status">NeuraOS is answering</span>}

      {failed && <AiErrorNotice onRetry={onRetry} />}

      {message.status === "done" && <AttachmentChips ids={message.citedFileIds} files={files} />}

      {message.status === "done" && (
        <div className="-ml-1 flex items-center gap-1">
          <FeedbackButtons rating={rating} onRate={onRate} />
          <ReplyButton onClick={onReply} name="NeuraOS" />
        </div>
      )}
    </li>
  );
}
