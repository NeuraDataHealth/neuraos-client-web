import "server-only";
import { ThinkingLevel, type Content } from "@google/genai";
import { answerModel, genai, safetySettings, toTokenUsage, type TokenUsage } from "./client";

export type AnswerRequest = {
  /** From buildSystemPrompt(). */
  systemInstruction: string;
  /** Shared files block, conversation and the current question (SPEC.md section 8). */
  contents: Content[];
};

/**
 * Streams the chat answer as text deltas and returns token usage when done.
 * The caller accumulates deltas and flushes them to the AI message every STREAM_FLUSH_MS.
 */
export async function* streamAnswer({
  systemInstruction,
  contents,
}: AnswerRequest): AsyncGenerator<string, TokenUsage> {
  const model = answerModel();
  const stream = await genai().models.generateContentStream({
    model,
    contents,
    config: {
      systemInstruction,
      safetySettings,
      thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
    },
  });

  let usage: TokenUsage = toTokenUsage(model, undefined);
  for await (const chunk of stream) {
    if (chunk.text) yield chunk.text;
    if (chunk.usageMetadata) usage = toTokenUsage(model, chunk.usageMetadata);
  }
  return usage;
}
