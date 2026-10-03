import type { ReactNode } from "react";
import { Text } from "@/components/ui/Text";

type ChipProps = {
  children: ReactNode;
};

/** Static pill label with the light key finish (not interactive). */
export function Chip({ children }: ChipProps) {
  return (
    <Text
      as="span"
      variant="chip"
      className="inline-flex h-8.5 items-center rounded-full border border-line-strong bg-linear-to-b from-key-light to-key-light-end px-3.5 shadow-chip"
    >
      {children}
    </Text>
  );
}
