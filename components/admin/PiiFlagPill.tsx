import { StatusPill } from "@/components/ui/StatusPill";

/** "2 flags" (amber) or "Clean" (grey). */
export function PiiFlagPill({ count }: { count: number }) {
  return count > 0 ? (
    <StatusPill tone="amber">
      {count} {count === 1 ? "flag" : "flags"}
    </StatusPill>
  ) : (
    <StatusPill tone="grey">Clean</StatusPill>
  );
}
