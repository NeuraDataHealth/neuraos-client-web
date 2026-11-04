"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";
import { AttachButton } from "@/components/chat/AttachButton";
import { FileChip } from "@/components/chat/FileChip";
import { MentionPicker } from "@/components/chat/MentionPicker";
import { mentionToken } from "@/components/chat/mentionText";
import { ReplyStrip } from "@/components/chat/ReplyStrip";
import { SendButton } from "@/components/chat/SendButton";
import { useMentionPicker, type MentionOption } from "@/components/chat/useMentionPicker";
import { usePendingUploads, type PendingUpload } from "@/components/chat/usePendingUploads";
import type { UploadTarget } from "@/hooks/chat/useUpload";
import { useUploadAllowance } from "@/hooks/chat/useUploadAllowance";
import { Text } from "@/components/ui/Text";
import { showToast } from "@/components/ui/toastStore";
import type { SendMessageRequest } from "@/lib/contracts/messages";
import { MAX_MESSAGE_CHARS, UPLOADS_PER_DAY } from "@/lib/limits";
import type { Mention, ReplyTo } from "@/lib/types";

export type ComposerDraft = SendMessageRequest & { uploads: PendingUpload[] };

type ComposerProps = {
  placeholder: string;
  /** Other members, offered in the @mention picker. */
  members: { uid: string; name: string }[];
  /** Groups only: solo chats always get an AI answer. */
  mentionsEnabled: boolean;
  replyTo: ReplyTo | null;
  onCancelReply?: () => void;
  /** Your previous AI reply is still running (one at a time per user). */
  busy: boolean;
  /** Uploads the server still allows (reserved uploads already counted). */
  uploadsRemaining: number;
  /** Where files go; defaults to the open chat. The new-chat screen creates its chat here. */
  uploadTarget?: UploadTarget;
  onSend: (draft: ComposerDraft) => void;
};

const COUNTER_FROM = MAX_MESSAGE_CHARS - 400;

/** Message pill: attach, text with @mentions, send. Enter sends, Shift+Enter adds a line. */
export function Composer(props: ComposerProps) {
  const { placeholder, members, mentionsEnabled, replyTo, onCancelReply, busy, uploadsRemaining, uploadTarget, onSend } = props;
  const [text, setText] = useState("");
  const [mentions, setMentions] = useState<Mention[]>([]);
  const uploads = usePendingUploads(uploadTarget);
  const allowance = useUploadAllowance();
  const picker = useMentionPicker(members, mentionsEnabled);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const listId = useId();

  const names = Object.fromEntries(members.map((m) => [m.uid, m.name]));
  const pickerState = picker.state(text);
  const tooLong = text.length > MAX_MESSAGE_CHARS;
  const canSend = text.trim().length > 0 && !tooLong;
  // Picked files the server hasn't reserved yet; reserved ones are already counted in both allowances.
  const unreserved = uploads.uploads.filter((u) => !u.fileId && u.status !== "failed");
  const chatLeft = uploadsRemaining - unreserved.length;
  const dayLeft = allowance ? allowance.uploadsLeft - unreserved.length : Infinity;
  const bytesLeft = allowance ? allowance.bytesLeft - unreserved.reduce((sum, u) => sum + u.sizeBytes, 0) : Infinity;

  function pick(option: MentionOption) {
    const next = picker.insert(text, option);
    setText(next.text);
    setMentions((list) => (list.some((m) => mentionToken(m, names) === option.token) ? list : [...list, option.mention]));
    picker.reset();
    requestAnimationFrame(() => {
      textareaRef.current?.focus();
      textareaRef.current?.setSelectionRange(next.caret, next.caret);
      picker.setCaret(next.caret);
    });
  }

  function send() {
    if (!canSend || busy) return;
    if (uploads.uploads.some((u) => u.status === "uploading" || u.status === "processing")) {
      return showToast("Wait for your files to finish.");
    }
    onSend({
      text: text.trim(),
      mentions: mentions.filter((m) => {
        const token = mentionToken(m, names);
        return token !== null && text.includes(token);
      }),
      replyToMsgId: replyTo?.msgId ?? null,
      attachmentIds: uploads.uploads.flatMap((u) => (u.status === "ready" && u.fileId ? [u.fileId] : [])),
      uploads: uploads.uploads.filter((u) => u.status === "ready"),
    });
    setText("");
    setMentions([]);
    uploads.clear();
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (pickerState.open) {
      const count = pickerState.matches.length;
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        picker.setActive((picker.active + (event.key === "ArrowDown" ? 1 : count - 1)) % count);
        return;
      }
      if (event.key === "Enter" || event.key === "Tab") {
        event.preventDefault();
        pick(pickerState.matches[Math.min(picker.active, count - 1)]);
        return;
      }
      if (event.key === "Escape") {
        event.preventDefault();
        picker.dismiss(text);
        return;
      }
    }
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      send();
    }
  }

  const activeOption = pickerState.open ? pickerState.matches[Math.min(picker.active, pickerState.matches.length - 1)] : null;

  return (
    <form
      className="flex flex-col gap-2.5"
      onSubmit={(event) => {
        event.preventDefault();
        send();
      }}
    >
      {replyTo && onCancelReply && <ReplyStrip reply={replyTo} onCancel={onCancelReply} />}
      {uploads.uploads.length > 0 && (
        <div className="flex flex-wrap gap-2 px-1">
          {uploads.uploads.map((u) => (
            <FileChip key={u.key} name={u.name} status={u.status} onRemove={() => uploads.remove(u.key)} />
          ))}
          {Number.isFinite(dayLeft) && (
            <Text as="span" variant="meta" className="self-center text-muted">
              {Math.max(0, dayLeft)} of {UPLOADS_PER_DAY} uploads left today
            </Text>
          )}
        </div>
      )}
      <div className="relative">
        {pickerState.open && (
          <MentionPicker
            id={listId}
            options={pickerState.matches}
            active={Math.min(picker.active, pickerState.matches.length - 1)}
            onPick={pick}
            onHover={picker.setActive}
          />
        )}
        <div className="flex min-h-15.5 items-end gap-2 rounded-composer border border-ink/8 bg-paper p-2.5 shadow-composer focus-within:border-accent/45">
          <AttachButton
            remaining={Math.max(0, Math.min(chatLeft, dayLeft))}
            limitedBy={dayLeft < chatLeft ? "day" : "chat"}
            bytesLeft={bytesLeft}
            onFiles={uploads.add}
          />
          <Text
            as="textarea"
            ref={textareaRef}
            variant="input"
            rows={1}
            value={text}
            placeholder={placeholder}
            aria-label="Message"
            role={mentionsEnabled ? "combobox" : undefined}
            aria-expanded={mentionsEnabled ? pickerState.open : undefined}
            aria-controls={pickerState.open ? listId : undefined}
            aria-autocomplete={mentionsEnabled ? "list" : undefined}
            aria-activedescendant={activeOption ? `${listId}-${activeOption.key}` : undefined}
            onChange={(event) => {
              setText(event.target.value);
              picker.setCaret(event.target.selectionStart);
              picker.setActive(0);
            }}
            onSelect={(event) => picker.setCaret(event.currentTarget.selectionStart)}
            onKeyDown={onKeyDown}
            className="max-h-36 min-w-0 flex-1 resize-none bg-transparent px-1 py-2.5 text-ink outline-none field-sizing-content placeholder:text-faint"
          />
          <SendButton busy={busy} disabled={!canSend} />
        </div>
      </div>
      {text.length > COUNTER_FROM && (
        <Text variant="mono-meta" className={tooLong ? "px-4 text-right text-danger-text" : "px-4 text-right text-muted"}>
          {text.length.toLocaleString("en-IN")} / {MAX_MESSAGE_CHARS.toLocaleString("en-IN")}
        </Text>
      )}
    </form>
  );
}
