import { Avatar } from "@/components/ui/Avatar";
import { Text } from "@/components/ui/Text";

/** Avatar, name and an optional sub line, truncated. */
export function PersonCell({ name, sub }: { name: string; sub?: string }) {
  return (
    <span className="flex min-w-0 items-center gap-3">
      <Avatar name={name} size="sm" />
      <span className="min-w-0">
        <Text as="span" variant="button-sm" className="block truncate">
          {name}
        </Text>
        {sub && (
          <Text as="span" variant="meta" className="mt-0.5 block truncate text-muted">
            {sub}
          </Text>
        )}
      </span>
    </span>
  );
}
