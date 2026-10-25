import { ModeSwitch } from "@/components/account/ModeSwitch";
import { Avatar } from "@/components/ui/Avatar";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Text } from "@/components/ui/Text";

type ProfileHeaderProps = {
  name: string;
  email: string;
};

/** Large avatar, name and email, with the app mode switch beside it. */
export function ProfileHeader({ name, email }: ProfileHeaderProps) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-6 pt-2">
      <div className="flex min-w-0 items-center gap-4.5">
        <Avatar name={name} size="2xl" tone="dark" />
        <div className="min-w-0">
          <Text as="h2" variant="profile-name">
            {name}
          </Text>
          <Text variant="mono" className="mt-1.5 truncate text-muted">
            {email}
          </Text>
        </div>
      </div>
      <div className="w-full max-w-95">
        <SectionLabel as="p">App mode</SectionLabel>
        <ModeSwitch mode="assistant" />
      </div>
    </div>
  );
}
