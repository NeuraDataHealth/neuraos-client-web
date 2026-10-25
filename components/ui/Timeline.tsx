import { clsx } from "clsx";
import { Text } from "@/components/ui/Text";

export type TimelineEntry = {
  id: string;
  title: string;
  meta: string;
  note?: string;
  tone?: "accent" | "ink" | "amber" | "red" | "grey";
};

const dotClass: Record<NonNullable<TimelineEntry["tone"]>, string> = {
  accent: "bg-accent",
  ink: "bg-ink",
  amber: "bg-warn",
  red: "bg-danger",
  grey: "bg-ghost",
};

/** Vertical history with dots and a connecting line (review history). */
export function Timeline({ entries }: { entries: TimelineEntry[] }) {
  return (
    <ol>
      {entries.map((entry, i) => {
        const last = i === entries.length - 1;
        return (
          <li key={entry.id} className="flex gap-3">
            <span className="flex w-3 shrink-0 flex-col items-center" aria-hidden="true">
              <span className={clsx("mt-1.25 size-2.25 rounded-full", dotClass[entry.tone ?? "grey"])} />
              {!last && <span className="mt-1 w-px flex-1 bg-ink/10" />}
            </span>
            <div className={clsx("min-w-0 flex-1", !last && "pb-4")}>
              <Text variant="button-sm">{entry.title}</Text>
              <Text variant="meta-md" className="mt-0.5 text-muted">
                {entry.meta}
              </Text>
              {entry.note && (
                <Text variant="body-sm" className="mt-1.5 text-ink-soft text-pretty">
                  {entry.note}
                </Text>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
