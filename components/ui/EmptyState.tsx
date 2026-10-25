import type { ReactNode } from "react";
import { IconTile } from "@/components/ui/IconTile";
import type { IconName } from "@/components/ui/icons";
import { Text } from "@/components/ui/Text";

type EmptyStateProps = {
  icon: IconName;
  title: string;
  description?: string;
  /** Optional action under the text. */
  children?: ReactNode;
};

/** Centred empty state for lists and tables. */
export function EmptyState({ icon, title, description, children }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-2.5 px-6 pt-14 pb-15 text-center">
      <IconTile icon={icon} />
      <Text as="p" variant="empty-title" className="mt-1.5">
        {title}
      </Text>
      {description && (
        <Text variant="body" className="max-w-90 text-muted text-pretty">
          {description}
        </Text>
      )}
      {children}
    </div>
  );
}
