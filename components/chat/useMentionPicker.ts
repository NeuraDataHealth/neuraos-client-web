"use client";

import { useState } from "react";
import type { Mention } from "@/lib/types";

export type MentionOption = { key: string; label: string; hint: string; token: string; mention: Mention };

type Members = { uid: string; name: string }[];

const AI_OPTION: MentionOption = {
  key: "ai",
  label: "NeuraOS AI",
  hint: "Ask the AI",
  token: "@AI",
  mention: { type: "ai" },
};

/** Finds an "@query" right before the caret. */
function activeQuery(text: string, caret: number) {
  const match = /(?:^|\s)@([^\s@]*)$/.exec(text.slice(0, caret));
  return match ? { query: match[1], start: caret - match[1].length - 1 } : null;
}

/**
 * State for the @mention picker: which options match the "@query" at the caret,
 * the highlighted option, and inserting a choice as a token plus a structured mention.
 */
export function useMentionPicker(members: Members, enabled: boolean) {
  const [caret, setCaret] = useState(0);
  const [active, setActive] = useState(0);
  const [dismissedAt, setDismissedAt] = useState<number | null>(null);

  const options = [AI_OPTION, ...members.map((m): MentionOption => ({
    key: m.uid,
    label: m.name,
    hint: "Member",
    token: `@${m.name}`,
    mention: { type: "user", uid: m.uid },
  }))];

  function state(text: string) {
    const found = enabled ? activeQuery(text, caret) : null;
    if (!found || dismissedAt === found.start) return { open: false as const, matches: [] as MentionOption[] };
    const q = found.query.toLowerCase();
    const matches = options.filter((o) => o.label.toLowerCase().includes(q) || o.token.toLowerCase().includes(q));
    return { open: matches.length > 0, matches, start: found.start };
  }

  /** Returns the new text and caret after inserting `option` at the current query. */
  function insert(text: string, option: MentionOption) {
    const found = activeQuery(text, caret);
    if (!found) return { text, caret };
    const before = text.slice(0, found.start);
    const inserted = `${option.token} `;
    return { text: before + inserted + text.slice(caret), caret: before.length + inserted.length };
  }

  return {
    state,
    insert,
    active,
    setActive,
    setCaret,
    dismiss: (text: string) => setDismissedAt(activeQuery(text, caret)?.start ?? null),
    reset: () => {
      setActive(0);
      setDismissedAt(null);
    },
  };
}
