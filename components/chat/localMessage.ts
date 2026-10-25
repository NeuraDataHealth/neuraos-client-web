import type { ComposerDraft } from "@/components/chat/Composer";
import type { FileDoc, FirestoreTimestamp, MessageDoc, ReplyTo } from "@/lib/types";

/**
 * Static stand-ins used until the chat hooks land: the optimistic message and
 * files the Firestore listener will deliver for real.
 */
export function timestampNow(): FirestoreTimestamp {
  const ms = Date.now();
  return {
    seconds: Math.floor(ms / 1000),
    nanoseconds: (ms % 1000) * 1_000_000,
    toDate: () => new Date(ms),
    toMillis: () => ms,
  };
}

export function localMessage(
  draft: ComposerDraft,
  sender: { uid: string; name: string },
  replyTo: ReplyTo | null,
  attachmentIds: string[],
): MessageDoc & { id: string } {
  const now = timestampNow();
  return {
    id: `local-${now.toMillis()}`,
    senderType: "user",
    senderId: sender.uid,
    senderName: sender.name,
    text: draft.text,
    mentions: draft.mentions,
    replyTo,
    triggeredBy: null,
    attachmentIds,
    citedFileIds: [],
    status: "done",
    createdAt: now,
    updatedAt: now,
  };
}

export function localFile(upload: ComposerDraft["uploads"][number], sender: { uid: string; name: string }): FileDoc {
  return {
    uploaderId: sender.uid,
    uploaderName: sender.name,
    fileName: upload.name,
    mimeType: upload.mimeType,
    sizeBytes: upload.sizeBytes,
    gcsUri: `local://${upload.key}`,
    status: "ready",
    summary: null,
    extractedText: null,
    tokenEstimate: null,
    createdAt: timestampNow(),
  };
}

/** "First 60 characters…" for reply quotes. */
export function snippet(text: string): string {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > 60 ? `${clean.slice(0, 60).trimEnd()}…` : clean;
}
