import { clsx } from "clsx";
import type { MentionOption } from "@/components/chat/useMentionPicker";
import { Avatar } from "@/components/ui/Avatar";
import { LogoMark } from "@/components/ui/LogoMark";
import { Text } from "@/components/ui/Text";

type MentionPickerProps = {
  id: string;
  options: MentionOption[];
  active: number;
  onPick: (option: MentionOption) => void;
  onHover: (index: number) => void;
};

/** Listbox above the composer for @AI and members; driven from the textarea (combobox). */
export function MentionPicker({ id, options, active, onPick, onHover }: MentionPickerProps) {
  return (
    <ul
      id={id}
      role="listbox"
      aria-label="Mention"
      className="absolute inset-x-0 bottom-full mb-2 overflow-hidden rounded-callout border border-ink/8 bg-paper p-1.5 shadow-dialog"
    >
      {options.map((option, i) => (
        <li
          key={option.key}
          id={`${id}-${option.key}`}
          role="option"
          aria-selected={i === active}
          onMouseDown={(event) => {
            event.preventDefault();
            onPick(option);
          }}
          onMouseEnter={() => onHover(i)}
          className={clsx(
            "flex cursor-pointer items-center gap-3 rounded-card px-2.5 py-2",
            i === active && "bg-field",
          )}
        >
          {option.mention.type === "ai" ? (
            <span className="flex size-7.5 items-center justify-center rounded-full bg-accent/8">
              <LogoMark className="size-4 text-ink" />
            </span>
          ) : (
            <Avatar name={option.label} size="xs" />
          )}
          <Text as="span" variant="button-sm" className="min-w-0 flex-1 truncate">
            {option.label}
          </Text>
          <Text as="span" variant="mono-meta" className="text-faint">
            {option.hint}
          </Text>
        </li>
      ))}
    </ul>
  );
}
