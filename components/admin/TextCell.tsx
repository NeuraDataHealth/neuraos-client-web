import { clsx } from "clsx";
import { Text } from "@/components/ui/Text";

/** One-line table text: ink, muted or mono. */
export function TextCell({ children, tone = "ink" }: { children: string; tone?: "ink" | "muted" | "mono" }) {
  return (
    <Text
      as="span"
      variant={tone === "mono" ? "mono-sm" : tone === "muted" ? "body-sm" : "body"}
      className={clsx("truncate", tone === "muted" && "text-muted", tone === "mono" && "text-ink-soft")}
    >
      {children}
    </Text>
  );
}
