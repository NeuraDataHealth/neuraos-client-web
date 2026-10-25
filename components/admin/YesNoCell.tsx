import { clsx } from "clsx";
import { Text } from "@/components/ui/Text";

/** Dot + Yes / No. */
export function YesNoCell({ value }: { value: boolean }) {
  return (
    <Text as="span" variant="body" className="flex items-center gap-2">
      <span aria-hidden="true" className={clsx("size-1.75 rounded-full", value ? "bg-accent" : "bg-toggle-off")} />
      {value ? "Yes" : "No"}
    </Text>
  );
}
