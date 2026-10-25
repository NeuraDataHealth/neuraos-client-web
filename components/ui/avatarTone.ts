/** The design's three avatar finishes, picked by a stable hash of the name. */
export type AvatarTone = "dark" | "accent" | "light";

const tones: AvatarTone[] = ["dark", "accent", "light"];

export function avatarTone(name: string): AvatarTone {
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return tones[hash % tones.length];
}

/** "Dr. Aarav Mehta" → "AM"; "Neha" → "N". */
export function initials(name: string): string {
  const parts = name.replace(/^Dr\.?\s*/i, "").split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "?";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}
