import "server-only";
import {
  GoogleGenAI,
  HarmBlockThreshold,
  HarmCategory,
  type GenerateContentResponseUsageMetadata,
  type SafetySetting,
} from "@google/genai";
import { requireEnv } from "@/lib/server/env";

/**
 * Gemini on Vertex AI. Authenticates with Application Default Credentials
 * (the App Hosting service account in production); there is no API key.
 */
let client: GoogleGenAI | undefined;

export function genai(): GoogleGenAI {
  client ??= new GoogleGenAI({
    vertexai: true,
    project: requireEnv("GOOGLE_CLOUD_PROJECT"),
    location: requireEnv("GOOGLE_CLOUD_LOCATION"),
  });
  return client;
}

/** Chat answers. */
export function answerModel(): string {
  return requireEnv("GEMINI_ANSWER_MODEL");
}

/** Guardrail, file extraction, file selector, PII check, transcription. */
export function fastModel(): string {
  return requireEnv("GEMINI_FAST_MODEL");
}

/** Guardrail layer 1: Vertex safety settings on every call. */
export const safetySettings: SafetySetting[] = [
  HarmCategory.HARM_CATEGORY_HARASSMENT,
  HarmCategory.HARM_CATEGORY_HATE_SPEECH,
  HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
  HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
].map((category) => ({ category, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE }));

/** Token counts for logging and the spend counter. Output includes thinking tokens. */
export type TokenUsage = {
  model: string;
  inputTokens: number;
  outputTokens: number;
};

export function toTokenUsage(
  model: string,
  metadata: GenerateContentResponseUsageMetadata | undefined,
): TokenUsage {
  return {
    model,
    inputTokens: metadata?.promptTokenCount ?? 0,
    outputTokens: (metadata?.candidatesTokenCount ?? 0) + (metadata?.thoughtsTokenCount ?? 0),
  };
}
