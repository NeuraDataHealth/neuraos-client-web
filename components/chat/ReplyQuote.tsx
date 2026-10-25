import { clsx } from "clsx";
import { Text } from "@/components/ui/Text";
import type { ReplyTo } from "@/lib/types";

type ReplyQuoteProps = {
  reply: ReplyTo;
  /** `dark` inside the user's own bubble. */
  tone?: "light" | "dark";
};

/** Quoted message at the top of a reply. */
export function ReplyQuote({ reply, tone = "light" }: ReplyQuoteProps) {
  return (
    <span
      className={clsx(
        "mb-2 block border-l-2 pl-2.5",
        tone === "light" ? "border-accent/50" : "border-on-dark-accent/60",
      )}
    >
      <Text as="span" variant="ui-xs" className={clsx("block", tone === "light" ? "text-ink" : "text-on-dark")}>
        {reply.senderName}
      </Text>
      <Text
        as="span"
        variant="meta-md"
        className={clsx("mt-0.5 block truncate", tone === "light" ? "text-muted" : "text-on-dark-muted")}
      >
        {reply.snippet}
      </Text>
    </span>
  );
}
