import { clsx } from "clsx";
import { Icon } from "@/components/ui/Icon";
import { Spinner } from "@/components/ui/Spinner";

type SendButtonProps = {
  /** Your previous question is still being answered. */
  busy: boolean;
  disabled: boolean;
};

/** Round accent submit key; shows a spinner while your AI reply runs. */
export function SendButton({ busy, disabled }: SendButtonProps) {
  return (
    <button
      type="submit"
      aria-label={busy ? "Waiting for NeuraOS to finish" : "Send"}
      title={busy ? "Waiting for NeuraOS to finish" : "Send"}
      disabled={disabled || busy}
      className={clsx(
        "flex size-10.5 shrink-0 cursor-pointer items-center justify-center rounded-full bg-linear-to-b from-accent-hi to-accent text-paper shadow-key-accent-sm transition-[filter,translate,opacity] duration-(--duration-press) hover:brightness-107 active:translate-y-0.5 disabled:cursor-default disabled:hover:brightness-100",
        disabled && !busy && "opacity-45",
      )}
    >
      {busy ? <Spinner className="border-paper/35 border-t-paper" /> : <Icon name="send" size={16} />}
    </button>
  );
}
