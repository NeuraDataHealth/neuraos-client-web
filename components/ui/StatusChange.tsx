import { Icon } from "@/components/ui/Icon";
import { StatusPill, type StatusTone } from "@/components/ui/StatusPill";

type Status = { label: string; tone: StatusTone };

type StatusChangeProps = {
  from: Status;
  to: Status;
};

/** "Pending → Approved", as in the audit log. */
export function StatusChange({ from, to }: StatusChangeProps) {
  return (
    <span className="flex min-w-0 items-center gap-1.5">
      <StatusPill tone={from.tone}>{from.label}</StatusPill>
      <span className="text-faint">
        <Icon name="transition" size={12} />
      </span>
      <span className="sr-only">to</span>
      <StatusPill tone={to.tone}>{to.label}</StatusPill>
    </span>
  );
}
