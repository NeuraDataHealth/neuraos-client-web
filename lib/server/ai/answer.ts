import "server-only";
import { ThinkingLevel, type Content } from "@google/genai";
import { MAX_ANSWER_OUTPUT_TOKENS } from "@/lib/limits";
import { answerModel, genai, safetySettings, toTokenUsage, withRetry, type TokenUsage } from "./client";

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
  // Retried only before the first token; a stream that breaks midway shows Retry.
  const stream = await withRetry(() =>
    genai().models.generateContentStream({
      model,
      contents,
      config: {
        systemInstruction,
        safetySettings,
        maxOutputTokens: MAX_ANSWER_OUTPUT_TOKENS,
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      },
    }),
  );

  let usage: TokenUsage = toTokenUsage(model, undefined);
  for await (const chunk of stream) {
    if (chunk.text) yield chunk.text;
    if (chunk.usageMetadata) usage = toTokenUsage(model, chunk.usageMetadata);
  }
  return usage;
}
