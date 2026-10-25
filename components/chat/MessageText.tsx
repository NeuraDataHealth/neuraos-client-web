import { clsx } from "clsx";
import { mentionSegments } from "@/components/chat/mentionText";
import type { Mention } from "@/lib/types";

type MessageTextProps = {
  text: string;
  mentions: Mention[];
  /** uid → display name, for mention tokens. */
  names: Record<string, string>;
  /** Mention colour: accent on light surfaces, soft accent on the dark bubble. */
  tone?: "light" | "dark";
};

/** Message text with structured mentions highlighted. Inherits the text style of its parent. */
export function MessageText({ text, mentions, names, tone = "light" }: MessageTextProps) {
  return (
    <>
      {mentionSegments(text, mentions, names).map((segment, i) =>
        segment.mention ? (
          <span key={i} className={clsx("font-medium", tone === "light" ? "text-accent" : "text-on-dark-accent")}>
            {segment.text}
          </span>
        ) : (
          <span key={i}>{segment.text}</span>
        ),
      )}
    </>
  );
}
