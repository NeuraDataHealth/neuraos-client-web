"use client";

import { clsx } from "clsx";
import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { Text } from "@/components/ui/Text";

/** Read-only invite link with a Copy key that confirms for 2 s. */
export function InviteLinkField({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const id = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(id);
  }, [copied]);

  return (
    <div className="flex h-14 items-center gap-2.5 rounded-full border border-ink/8 bg-field pr-1.5 pl-4.5 inset-shadow-field">
      <span className="text-muted">
        <Icon name="link" size={16} />
      </span>
      <Text as="span" variant="mono-link" className="min-w-0 flex-1 truncate">
        {url.replace(/^https?:\/\//, "")}
      </Text>
      <button
        type="button"
        onClick={() => {
          navigator.clipboard?.writeText(url).catch(() => {});
          setCopied(true);
        }}
        className={clsx(
          "flex h-11 min-w-26 shrink-0 cursor-pointer items-center justify-center gap-1.75 rounded-full px-4 transition-colors duration-(--duration-border)",
          copied
            ? "bg-accent/10 text-accent"
            : "bg-linear-to-b from-accent-hi to-accent text-paper shadow-key-accent-sm hover:brightness-107",
        )}
      >
        <Icon name={copied ? "check" : "copy"} size={14} />
        <Text as="span" variant="button-sm">
          {copied ? "Copied" : "Copy"}
        </Text>
        <span className="sr-only" role="status">
          {copied ? "Invite link copied" : ""}
        </span>
      </button>
    </div>
  );
}
