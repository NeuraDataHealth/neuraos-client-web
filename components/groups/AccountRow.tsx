import { Avatar } from "@/components/ui/Avatar";
import { Text } from "@/components/ui/Text";

type AccountRowProps = {
  name: string;
  email: string;
  onSwitch: () => void;
};

/** The Google account you're about to join with, and a way to switch it. */
export function AccountRow({ name, email, onSwitch }: AccountRowProps) {
  return (
    <div className="flex h-14 items-center gap-2.5 rounded-full border border-ink/6 bg-field px-2 text-left">
      <Avatar name={name} size="md" tone="accent" />
      <div className="min-w-0 flex-1">
        <Text variant="button-sm">{name}</Text>
        <Text variant="meta" className="mt-0.5 truncate text-muted">
          {email}
        </Text>
      </div>
      <Text
        as="button"
        type="button"
        variant="ui-xs"
        onClick={onSwitch}
        className="h-9 shrink-0 cursor-pointer rounded-full px-3 text-accent hover:bg-accent/8"
      >
        Switch
      </Text>
    </div>
  );
}
