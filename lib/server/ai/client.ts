import "server-only";
import {
  ApiError,
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
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
];

const RETRY_DELAYS_MS = [1_000, 3_000];

/**
 * Runs a Gemini call, retrying twice with backoff when Vertex answers 429 (quota)
 * or 503 (overloaded). Other errors are thrown at once.
 */
export async function withRetry<T>(call: () => Promise<T>): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await call();
    } catch (error) {
      const status = error instanceof ApiError ? error.status : 0;
      if ((status !== 429 && status !== 503) || attempt >= RETRY_DELAYS_MS.length) throw error;
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAYS_MS[attempt]));
    }
  }
}

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
