import "server-only";
import type { ContentListUnion } from "@google/genai";
import { z } from "zod";
import { fastModel, genai, safetySettings, toTokenUsage, withRetry, type TokenUsage } from "./client";

/** One fast-model call with structured output, validated by the same zod schema. */
export async function generateJson<T extends z.ZodType>(
  schema: T,
  systemInstruction: string,
  contents: ContentListUnion,
): Promise<{ data: z.infer<T>; usage: TokenUsage }> {
  const model = fastModel();
  const jsonSchema: Record<string, unknown> = z.toJSONSchema(schema);
  delete jsonSchema.$schema;

  const response = await withRetry(() =>
    genai().models.generateContent({
      model,
      contents,
      config: {
        systemInstruction,
        safetySettings,
        responseMimeType: "application/json",
        responseJsonSchema: jsonSchema,
      },
    }),
  );

  const raw = (response.text ?? "").trim();
  const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(cleaned || "{}");
  } catch {
    // Never include the raw output: it can echo message text or transcripts into the logs.
    throw new Error(`Failed to parse structured JSON from model ${model}`);
  }

  return {
    data: schema.parse(parsedJson),
    usage: toTokenUsage(model, response.usageMetadata),
  };
}
