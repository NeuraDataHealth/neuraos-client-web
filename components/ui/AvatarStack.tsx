import { Avatar, type AvatarSize } from "@/components/ui/Avatar";

type AvatarStackProps = {
  names: string[];
  size?: AvatarSize;
};

/** Overlapping avatars for group members (10px overlap, as designed). Names can repeat, so keys use the position. */
export function AvatarStack({ names, size = "sm" }: AvatarStackProps) {
  return (
    <span className="flex -space-x-2.5" aria-hidden="true">
      {names.map((name, i) => (
        <Avatar key={`${i}-${name}`} name={name} size={size} ring />
      ))}
    </span>
  );
}
