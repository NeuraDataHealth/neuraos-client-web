import NextLink from "next/link";
import { verificationPill } from "@/components/account/statusPills";
import { Avatar } from "@/components/ui/Avatar";
import { keyClassName, keyTextVariant } from "@/components/ui/keyStyles";
import { KeyValueList } from "@/components/ui/KeyValueList";
import { LogoMark } from "@/components/ui/LogoMark";
import { Panel } from "@/components/ui/Panel";
import { StatusPill } from "@/components/ui/StatusPill";
import { Text } from "@/components/ui/Text";
import type { AdminContribution, AdminUser } from "@/lib/contracts/admin";

type ContributorCardProps = {
  user: AdminUser | undefined;
  name: string;
  registration: string | null;
  contributions: AdminContribution[];
};

/** Who submitted the case: verification, track record, link to their user detail. */
export function ContributorCard({ user, name, registration, contributions }: ContributorCardProps) {
  const approved = contributions.filter((c) => c.status === "approved").length;
  const rejected = contributions.filter((c) => c.status === "rejected").length;
  const verified = user?.verificationStatus === "approved";
  return (
    <Panel size="lg" className="flex flex-col gap-4 p-5">
      <Text as="h2" variant="badge" className="text-muted">
        Contributor
      </Text>
      <div className="flex items-center gap-3">
        <Avatar name={name} size="lg" />
        <div className="min-w-0 flex-1">
          <Text variant="item-title">{name}</Text>
          <Text variant="meta-md" className="mt-0.5 text-muted">
            {user?.specialty ?? "—"}
          </Text>
        </div>
      </div>
      {verified ? (
        <Text
          as="span"
          variant="ui-xs"
          className="flex h-7.5 items-center gap-1.75 self-start rounded-full bg-linear-to-b from-accent-hi to-accent pr-3 pl-1.5 text-paper shadow-key-accent-sm"
        >
          <span className="flex size-5 items-center justify-center rounded-full bg-paper/18">
            <LogoMark className="size-3 text-paper" />
          </span>
          Verified doctor
        </Text>
      ) : (
        user && (
          <StatusPill tone={verificationPill[user.verificationStatus].tone} className="self-start">
            {verificationPill[user.verificationStatus].label}
          </StatusPill>
        )
      )}
      <div className="border-t border-ink/7">
        <KeyValueList
          layout="split"
          items={[
            { label: "Registration", value: registration ?? "—" },
            { label: "Contributions", value: `${approved} approved · ${rejected} rejected` },
            { label: "Can contribute", value: user?.canContribute ? "Yes" : "No" },
          ]}
        />
      </div>
      {user && (
        <Text
          as={NextLink}
          href={`/admin/users?user=${user.uid}`}
          variant={keyTextVariant("app-light-sm")}
          className={keyClassName("app-light-sm", "w-full")}
        >
          View profile
        </Text>
      )}
    </Panel>
  );
}
