import { AttachmentChips } from "@/components/chat/AttachmentChips";
import { MessageText } from "@/components/chat/MessageText";
import { ReplyButton } from "@/components/chat/ReplyButton";
import { ReplyQuote } from "@/components/chat/ReplyQuote";
import { Avatar } from "@/components/ui/Avatar";
import { Text } from "@/components/ui/Text";
import type { FileDoc, MessageDoc } from "@/lib/types";

type PeerMessageProps = {
  message: MessageDoc;
  names: Record<string, string>;
  files: Record<string, FileDoc>;
  onReply: () => void;
};

/** Another member's message: avatar, name and a white bubble on the left. */
export function PeerMessage({ message, names, files, onReply }: PeerMessageProps) {
  return (
    <li className="group flex max-w-[78%] items-end gap-2.5 self-start">
      <Avatar name={message.senderName} size="xs" />
      <div className="flex min-w-0 flex-col items-start gap-1.5">
        <Text as="span" variant="meta" className="pl-1.5 text-muted">
          {message.senderName}
        </Text>
        <AttachmentChips ids={message.attachmentIds} files={files} />
        <Text
          as="div"
          variant="message"
          className="rounded-panel-lg rounded-bl-tail border border-ink/8 bg-paper px-4.5 py-3.25 whitespace-pre-wrap shadow-card-sm [overflow-wrap:anywhere]"
        >
          {message.replyTo && <ReplyQuote reply={message.replyTo} />}
          <MessageText text={message.text} mentions={message.mentions} names={names} />
        </Text>
        <ReplyButton onClick={onReply} name={message.senderName} />
      </div>
    </li>
  );
}

