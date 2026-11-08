import type { TokenUsage } from "./client";

/** USD per 1M tokens. Output includes thinking tokens. */
type Price = { input: number; output: number };

/** Vertex AI list prices double from this date (SPEC.md section 4). */
const PRICE_CHANGE_AT = Date.UTC(2027, 0, 1);

/**
 * Vertex AI standard prices on the global endpoint (`GOOGLE_CLOUD_LOCATION=global`),
 * checked Nov 2026. Regional endpoints cost about 10% more.
 */
const prices: Record<string, { current: Price; from2027: Price }> = {
  "gemini-3.8-flash": { current: { input: 0.75, output: 3.75 }, from2027: { input: 1.5, output: 7.5 } },
  "gemini-3.5-flash-lite": { current: { input: 0.3, output: 2.5 }, from2027: { input: 0.6, output: 5 } },
};

/** Longest known model name the given model starts with (handles suffixes like `-001`). */
function priceFor(model: string, at: Date): Price {
  const key = Object.keys(prices)
    .filter((name) => model.startsWith(name))
    .sort((a, b) => b.length - a.length)[0];
  const later = at.getTime() >= PRICE_CHANGE_AT;
  if (key) return later ? prices[key].from2027 : prices[key].current;
  // Unknown model: charge the most expensive known price so the spend cap errs on the safe side.
  const all = Object.values(prices).map((p) => (later ? p.from2027 : p.current));
  return { input: Math.max(...all.map((p) => p.input)), output: Math.max(...all.map((p) => p.output)) };
}

/** Cost of one model call in USD. */
export function costUsd(usage: TokenUsage, at: Date = new Date()): number {
  const price = priceFor(usage.model, at);
  return (usage.inputTokens * price.input + usage.outputTokens * price.output) / 1_000_000;
}
