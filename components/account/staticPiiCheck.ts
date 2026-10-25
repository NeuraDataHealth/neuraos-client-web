import type { PiiFlag } from "@/lib/types";

/**
 * Static stand-in for the server's PII check (fast model): flags titled names,
 * 10-digit phone numbers and 12-digit ID numbers so the warning flow can be tried.
 * At integration the flags come from api.contributions.submit.
 */
export function staticPiiCheck(text: string): PiiFlag[] {
  const flags: PiiFlag[] = [];
  for (const m of text.matchAll(/\b(?:Mr|Mrs|Ms|Shri|Smt)\.?\s+[A-Z][a-z]+/g)) flags.push({ kind: "name", excerpt: m[0] });
  for (const m of text.matchAll(/(?:\+91[\s-]?)?\b\d{5}[\s-]?\d{5}\b/g)) flags.push({ kind: "phone", excerpt: m[0] });
  for (const m of text.matchAll(/\b\d{4}\s\d{4}\s\d{4}\b/g)) flags.push({ kind: "id_number", excerpt: m[0] });
  return flags;
}
