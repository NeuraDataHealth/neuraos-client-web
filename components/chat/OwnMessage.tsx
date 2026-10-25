import { AttachmentChips } from "@/components/chat/AttachmentChips";
import { MessageText } from "@/components/chat/MessageText";
import { ReplyButton } from "@/components/chat/ReplyButton";
import { ReplyQuote } from "@/components/chat/ReplyQuote";
import { Text } from "@/components/ui/Text";
import type { FileDoc, MessageDoc } from "@/lib/types";

type OwnMessageProps = {
  message: MessageDoc;
  names: Record<string, string>;
  files: Record<string, FileDoc>;
  onReply: () => void;
};

/** The signed-in user's message: dark bubble on the right. */
export function OwnMessage({ message, names, files, onReply }: OwnMessageProps) {
  return (
    <li className="group flex max-w-[78%] flex-col items-end gap-1.5 self-end">
      <AttachmentChips ids={message.attachmentIds} files={files} />
      <Text
        as="div"
        variant="message"
        className="rounded-panel-lg rounded-br-tail bg-linear-to-b from-key-dark to-ink px-4.5 py-3.25 whitespace-pre-wrap text-on-dark shadow-bubble [overflow-wrap:anywhere]"
      >
        {message.replyTo && <ReplyQuote reply={message.replyTo} tone="dark" />}
        <MessageText text={message.text} mentions={message.mentions} names={names} tone="dark" />
      </Text>
      <ReplyButton onClick={onReply} name="your message" />
    </li>
  );
}
