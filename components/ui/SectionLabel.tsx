import type { ReactNode } from "react";
import { Text } from "@/components/ui/Text";

type SectionLabelProps = {
  children: ReactNode;
  /** Heading level for the label; defaults to h2. */
  as?: "h2" | "h3" | "p";
  /** Right-aligned extra (count, link). */
  aside?: ReactNode;
  id?: string;
};

/** Mono uppercase label above a panel. */
export function SectionLabel({ children, as = "h2", aside, id }: SectionLabelProps) {
  return (
    <div className="flex items-center justify-between gap-3 px-1 pb-2.5">
      <Text as={as} id={id} variant="badge" className="text-muted">
        {children}
      </Text>
      {aside}
    </div>
  );
}
