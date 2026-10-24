import "server-only";
import type { ContentListUnion } from "@google/genai";
import { z } from "zod";
import { fastModel, genai, safetySettings, toTokenUsage, type TokenUsage } from "./client";

/** One fast-model call with structured output, validated by the same zod schema. */
export async function generateJson<T extends z.ZodType>(
  schema: T,
  systemInstruction: string,
  contents: ContentListUnion,
): Promise<{ data: z.infer<T>; usage: TokenUsage }> {
  const model = fastModel();
  const jsonSchema: Record<string, unknown> = z.toJSONSchema(schema);
  delete jsonSchema.$schema;

  const response = await genai().models.generateContent({
    model,
    contents,
    config: {
      systemInstruction,
      safetySettings,
      responseMimeType: "application/json",
      responseJsonSchema: jsonSchema,
    },
  });

  return {
    data: schema.parse(JSON.parse(response.text ?? "")),
    usage: toTokenUsage(model, response.usageMetadata),
  };
}
