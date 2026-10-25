"use client";

import { useEffect, useState } from "react";
import { useOrigin } from "@/components/groups/useOrigin";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { LogoMark } from "@/components/ui/LogoMark";
import { Text } from "@/components/ui/Text";

type ReferralCardProps = {
  code: string;
  invited: number;
  qualified: number;
};

/** Dark card (the design's subscription card): referral link to copy and how many signed up. */
export function ReferralCard({ code, invited, qualified }: ReferralCardProps) {
  const origin = useOrigin();
  const [copied, setCopied] = useState(false);
  const url = `${origin}/?ref=${code}`;

  useEffect(() => {
    if (!copied) return;
    const id = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(id);
  }, [copied]);

  return (
    <div className="flex flex-col gap-5 rounded-panel-lg bg-linear-to-b from-key-dark to-ink p-5 text-on-dark shadow-dark-card">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Text as="h3" variant="item-title">
            Invite colleagues
          </Text>
          <Text variant="caption" className="mt-1.5 text-on-dark-muted text-pretty">
            Share your link. A colleague counts once they sign up and get their first answer.
          </Text>
        </div>
        <LogoMark className="size-7 shrink-0 text-on-dark" />
      </div>
      <div className="grid grid-cols-2">
        <div className="flex flex-col gap-2">
          <Text as="span" variant="stat">
            {invited}
          </Text>
          <Text as="span" variant="pill" className="text-on-dark-muted">
            Signed up
          </Text>
        </div>
        <div className="flex flex-col gap-2 border-l border-paper/10 pl-4.5">
          <Text as="span" variant="stat" className="text-on-dark-accent">
            {qualified}
          </Text>
          <Text as="span" variant="pill" className="text-on-dark-muted">
            Got an answer
          </Text>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2.5">
        <Text as="span" variant="mono-link" className="min-w-0 flex-1 truncate text-on-dark-muted">
          {url.replace(/^https?:\/\//, "")}
        </Text>
        <Button
          look="app-silver-sm"
          onClick={() => {
            navigator.clipboard?.writeText(url).catch(() => {});
            setCopied(true);
          }}
        >
          <Icon name={copied ? "check" : "copy"} size={14} />
          {copied ? "Copied" : "Copy link"}
        </Button>
      </div>
    </div>
  );
}
