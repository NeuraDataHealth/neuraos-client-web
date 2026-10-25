import type { Mention } from "@/lib/types";

export type TextSegment = { text: string; mention: boolean };

/** Tokens the composer inserts for each mention. */
export function mentionToken(mention: Mention, names: Record<string, string>): string | null {
  if (mention.type === "ai") return "@AI";
  const name = names[mention.uid];
  return name ? `@${name}` : null;
}

/**
 * Splits text so structured mentions render highlighted. Only tokens backed by
 * a mention are highlighted; the text itself is never parsed for mentions.
 */
export function mentionSegments(text: string, mentions: Mention[], names: Record<string, string>): TextSegment[] {
  const tokens = mentions
    .map((mention) => mentionToken(mention, names))
    .filter((token): token is string => Boolean(token))
    .sort((a, b) => b.length - a.length);
  if (tokens.length === 0) return [{ text, mention: false }];

  const pattern = new RegExp(`(${tokens.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "g");
  return text
    .split(pattern)
    .filter(Boolean)
    .map((part) => ({ text: part, mention: tokens.includes(part) }));
}
