import { clsx } from "clsx";
import { Icon } from "@/components/ui/Icon";

type RecordKeyProps = {
  recording: boolean;
  onClick: () => void;
};

/** The design's big record key: accent mic to start; white key with an accent square and halo while recording. */
export function RecordKey({ recording, onClick }: RecordKeyProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={recording ? "Stop recording" : "Start recording"}
      aria-pressed={recording}
      className={clsx(
        "flex size-26 cursor-pointer items-center justify-center rounded-full active:translate-y-0.5",
        recording && "bg-(image:--gradient-record-halo)",
      )}
    >
      {recording ? (
        <span className="flex size-20 items-center justify-center rounded-full border border-line-strong bg-linear-to-b from-key-light to-key-light-end shadow-record-live">
          <span className="size-7 rounded-stop bg-linear-to-b from-accent-hi to-accent shadow-key-accent-sm" />
        </span>
      ) : (
        <span className="flex size-20 items-center justify-center rounded-full bg-linear-to-b from-accent-hi to-accent text-paper shadow-key-accent-xl">
          <Icon name="mic" size={28} />
        </span>
      )}
    </button>
  );
}
