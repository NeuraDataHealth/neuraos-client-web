import { Text } from "@/components/ui/Text";
import type { PiiFlag } from "@/lib/types";

const kindLabel: Record<PiiFlag["kind"], string> = {
  name: "Name",
  phone: "Phone",
  id_number: "ID",
  address: "Address",
};

/** Paragraphs with each flagged excerpt highlighted and labelled (design/admin PII marks). */
export function PiiText({ text, flags }: { text: string; flags: PiiFlag[] }) {
  const excerpts = flags.map((f) => f.excerpt).filter(Boolean);
  const pattern = excerpts.length
    ? new RegExp(`(${excerpts.map((e) => e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "g")
    : null;

  return (
    <div className="flex flex-col gap-4">
      {text.split(/\n{2,}/).map((paragraph, i) => (
        <Text key={i} variant="reading" className="text-ink-soft text-pretty">
          {(pattern ? paragraph.split(pattern) : [paragraph]).map((part, j) => {
            const flag = flags.find((f) => f.excerpt === part);
            if (!flag) return <span key={j}>{part}</span>;
            return (
              <mark key={j} className="rounded-sm bg-pii px-1.25 py-px text-pii-text inset-shadow-pii">
                {part}
                <Text as="span" variant="pill" className="ml-1.5 align-[1px] text-amber-text">
                  {kindLabel[flag.kind]}
                </Text>
              </mark>
            );
          })}
        </Text>
      ))}
    </div>
  );
}
