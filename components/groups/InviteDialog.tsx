"use client";

import NextLink from "next/link";
import { InviteLinkField } from "@/components/groups/InviteLinkField";
import { memberList } from "@/components/groups/joinedLabel";
import { useOrigin } from "@/components/groups/useOrigin";
import { AvatarStack } from "@/components/ui/AvatarStack";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Icon } from "@/components/ui/Icon";
import { Text } from "@/components/ui/Text";
import { MAX_MEMBERS } from "@/lib/limits";

type InviteDialogProps = {
  open: boolean;
  onClose: () => void;
  memberNames: string[];
  isOwner: boolean;
  ownerName: string;
  /** Null when the link is off. */
  token: string | null;
  onRotate: () => void;
  onRevoke: () => void;
  onTurnOn: () => void;
};

/** Invite link: copy, rotate, revoke or turn on (owner); everyone else can copy. */
export function InviteDialog(props: InviteDialogProps) {
  const { open, onClose, memberNames, isOwner, ownerName, token, onRotate, onRevoke, onTurnOn } = props;
  const origin = useOrigin();
  const full = memberNames.length >= MAX_MEMBERS;
  const joinPath = token ? `/join/${token}` : "/join/expired";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Invite to group"
      description="Send this link to colleagues. They sign in with Google to join."
      badge={`${memberNames.length} of ${MAX_MEMBERS}`}
    >
      <div className="flex flex-col gap-4.5">
        <div className="flex items-center gap-3">
          <AvatarStack names={memberNames} size="sm" />
          <Text variant="body" className="min-w-0 text-ink-soft">
            {memberList(memberNames)}
          </Text>
        </div>

        {token ? (
          <div className="flex flex-col gap-3">
            <InviteLinkField url={`${origin}${joinPath}`} />
            {full && (
              <Text variant="body-sm" className="px-1 text-muted">
                The group is full. New people can&apos;t join until someone leaves.
              </Text>
            )}
            {isOwner ? (
              <div className="flex flex-wrap gap-2">
                <Button look="app-light-xs" onClick={onRotate}>
                  <Icon name="refresh" size={14} />
                  Generate new link
                </Button>
                <Button look="app-danger-ghost" onClick={onRevoke}>
                  Revoke link
                </Button>
              </div>
            ) : (
              <Text variant="caption" className="px-1 text-faint">
                Only {ownerName} can turn off or change this link.
              </Text>
            )}
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-3.5 rounded-panel border border-dashed border-ink/18 bg-callout py-4 pr-4 pl-4.5">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-line bg-paper text-muted">
              <Icon name="link-off" size={17} />
            </span>
            <div className="min-w-45 flex-1">
              <Text as="p" variant="item-title">
                Link is off
              </Text>
              <Text variant="caption" className="mt-0.75 text-muted">
                No one can join right now. Turning it on makes a new link.
              </Text>
            </div>
            {isOwner && (
              <Button look="app-accent-sm" onClick={onTurnOn}>
                Turn on
              </Button>
            )}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <Text
            as={NextLink}
            href={joinPath}
            target="_blank"
            variant="ui-sm"
            className="inline-flex items-center gap-1.5 text-accent hover:text-accent-deep"
          >
            Preview join page
            <Icon name="external" size={11} />
            <span className="sr-only">(opens in a new tab)</span>
          </Text>
          <Button look="app-accent-md" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
