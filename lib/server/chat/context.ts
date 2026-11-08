import "server-only";
import type { DocumentReference, DocumentSnapshot } from "firebase-admin/firestore";
import { CONTEXT_FILE_TOKEN_BUDGET, HISTORY_MESSAGES_IN_CONTEXT } from "@/lib/limits";
import { selectFiles } from "@/lib/server/ai/files";
import type { TokenUsage } from "@/lib/server/ai/client";
import type { FileDoc, MessageDoc, WithId } from "@/lib/types";

/** Longest quoted message passed to the model. */
const QUOTE_MAX_CHARS = 2_000;

export type ReplyContext = {
  /** The prompt: shared files, conversation, quoted message and the question (SPEC.md section 8). */
  prompt: string;
  /** Ready files in the chat; citations in the answer are matched against these. */
  files: WithId<FileDoc>[];
  /** Fast-model calls made while building the context, for the spend counter. */
  usages: TokenUsage[];
};

/**
 * Builds the model input for one question. History ends at the question itself,
 * so a retry never sees messages posted after it.
 */
export async function buildReplyContext(
  chatRef: DocumentReference,
  question: DocumentSnapshot,
): Promise<ReplyContext> {
  const message = question.data() as MessageDoc;
  const [fileBlock, history, quote] = await Promise.all([
    buildFileBlock(chatRef, message.text, message.senderName),
    buildHistory(chatRef, question),
    buildQuote(chatRef, message),
  ]);

  const prompt = [
    fileBlock.text,
    quote,
    ["[Conversation]", ...history, line(message)].join("\n"),
  ]
    .filter(Boolean)
    .join("\n\n");

  return { prompt, files: fileBlock.files, usages: fileBlock.usages };
}

/** The files whose name the answer mentions (the prompt asks the model to cite by name). */
export function citedFiles(answer: string, files: WithId<FileDoc>[]): string[] {
  const text = answer.toLowerCase();
  return files.filter((f) => text.includes(f.fileName.toLowerCase())).map((f) => f.id);
}

function line(message: MessageDoc): string {
  const name = message.senderType === "system" ? "System" : message.senderName;
  return `[${name}]: ${message.text}`;
}

/** Earlier messages, oldest first; skips empty, streaming and failed AI replies. */
async function buildHistory(chatRef: DocumentReference, question: DocumentSnapshot): Promise<string[]> {
  const snap = await chatRef
    .collection("messages")
    .orderBy("createdAt", "desc")
    .startAfter(question)
    .limit(HISTORY_MESSAGES_IN_CONTEXT - 1)
    .get();

  return snap.docs
    .reverse()
    .map((d) => d.data() as MessageDoc)
    .filter((m) => m.text.trim() && (m.senderType !== "ai" || m.status === "done" || m.status === "blocked"))
    .map(line);
}

/** The message the question replies to, in full (SPEC.md section 7, step 6). */
async function buildQuote(chatRef: DocumentReference, message: MessageDoc): Promise<string> {
  if (!message.replyTo) return "";
  const snap = await chatRef.collection("messages").doc(message.replyTo.msgId).get();
  const quoted = snap.data() as MessageDoc | undefined;
  const text = quoted?.text ?? message.replyTo.snippet;
  if (!text) return "";
  return `[Quoted message, from ${message.replyTo.senderName}]\n${text.slice(0, QUOTE_MAX_CHARS)}`;
}

/**
 * All file summaries, plus the full text of every file when it fits the budget,
 * otherwise of the files the selector picks (summaries only if the selector fails).
 */
async function buildFileBlock(
  chatRef: DocumentReference,
  question: string,
  askerName: string,
): Promise<{ text: string; files: WithId<FileDoc>[]; usages: TokenUsage[] }> {
  const snap = await chatRef.collection("files").where("status", "==", "ready").get();
  if (snap.empty) return { text: "", files: [], usages: [] };

  const files = snap.docs.map((d) => ({ id: d.id, ...(d.data() as FileDoc) }));
  const usages: TokenUsage[] = [];
  const tokens = files.reduce((sum, f) => sum + (f.tokenEstimate ?? Math.ceil((f.extractedText?.length ?? 0) / 4)), 0);

  let included = files;
  if (tokens > CONTEXT_FILE_TOKEN_BUDGET) {
    try {
      const summaries = files.map((f) => ({
        fileId: f.id,
        fileName: f.fileName,
        uploaderName: f.uploaderName,
        summary: f.summary ?? "",
      }));
      const picked = await selectFiles(question, askerName, summaries);
      usages.push(picked.usage);
      const ids = new Set(picked.fileIds);
      included = files.filter((f) => ids.has(f.id));
    } catch {
      included = [];
    }
  }

  const summaries = files.map(
    (f, i) => `File ${i + 1}: ${f.fileName}, uploaded by ${f.uploaderName}\n  Summary: ${f.summary ?? ""}`,
  );
  const fullText = included
    .filter((f) => f.extractedText)
    .map((f) => `<<<FILE_TEXT file="${f.fileName}">>>\n${f.extractedText}\n<<<END_FILE_TEXT>>>`);

  return {
    text: ["[Shared files in this chat]", ...summaries, ...(fullText.length ? ["", fullText.join("\n\n")] : [])].join("\n"),
    files,
    usages,
  };
}
