import { clsx } from "clsx";
import { Icon } from "@/components/ui/Icon";
import { Spinner } from "@/components/ui/Spinner";
import { Text } from "@/components/ui/Text";

export type FileChipStatus = "uploading" | "processing" | "ready" | "failed";

type FileChipProps = {
  name: string;
  status: FileChipStatus;
  /** Shows a remove button (composer). */
  onRemove?: () => void;
};

const statusLabel: Record<Exclude<FileChipStatus, "ready">, string> = {
  uploading: "Uploading",
  processing: "Reading",
  failed: "Couldn't read",
};

/** File pill: spinner while uploading or being read, then the name; red when it failed. */
export function FileChip({ name, status, onRemove }: FileChipProps) {
  const busy = status === "uploading" || status === "processing";
  return (
    <span
      className={clsx(
        "inline-flex h-7 max-w-full items-center gap-1.5 rounded-full border bg-linear-to-b from-key-light to-key-light-end pr-2.75 pl-2.25 shadow-chip",
        status === "failed" ? "border-danger/30 text-danger-text" : "border-line text-ink-soft",
        onRemove && "pr-1",
      )}
    >
      {busy ? <Spinner className="size-3" /> : <Icon name={status === "failed" ? "warning" : "file"} size={13} />}
      <Text as="span" variant="mono-meta" className="min-w-0 truncate">
        {name}
      </Text>
      {status !== "ready" && (
        <Text as="span" variant="mono-meta" className={status === "failed" ? "" : "text-faint"}>
          · {statusLabel[status]}
        </Text>
      )}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${name}`}
          className="ml-0.5 flex size-5 cursor-pointer items-center justify-center rounded-full text-muted hover:bg-ink/6 hover:text-ink"
        >
          <Icon name="close" size={8} />
        </button>
      )}
    </span>
  );
}
