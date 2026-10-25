import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Text } from "@/components/ui/Text";
import type { PiiFlag } from "@/lib/types";

const kindLabel: Record<PiiFlag["kind"], string> = {
  name: "Patient name",
  phone: "Phone number",
  id_number: "ID number",
  address: "Address",
};

type PiiDialogProps = {
  open: boolean;
  flags: PiiFlag[];
  onEdit: () => void;
  onSubmitAnyway: () => void;
};

/** Flags from the PII check before submit; the reviewer sees them too. */
export function PiiDialog({ open, flags, onEdit, onSubmitAnyway }: PiiDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onEdit}
      title="This may identify a patient"
      description="Remove these before you submit, or submit anyway if they're not patient details. The reviewer will see these flags."
      badge={`${flags.length} ${flags.length === 1 ? "flag" : "flags"}`}
    >
      <div className="flex flex-col gap-5">
        <ul className="divide-y divide-ink/7 overflow-hidden rounded-callout border border-ink/8">
          {flags.map((flag, i) => (
            <li key={`${flag.kind}-${i}`} className="flex items-center justify-between gap-3 px-4 py-3">
              <Text as="span" variant="body" className="text-muted">
                {kindLabel[flag.kind]}
              </Text>
              <Text as="mark" variant="mono-sm" className="rounded-sm bg-pii px-1.5 py-0.5 text-pii-text inset-shadow-pii">
                {flag.excerpt}
              </Text>
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap justify-end gap-2.5">
          <Button look="app-light-md" onClick={onSubmitAnyway}>
            Submit anyway
          </Button>
          <Button look="app-accent-md" onClick={onEdit}>
            Edit text
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
