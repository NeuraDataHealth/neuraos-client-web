import { Panel } from "@/components/ui/Panel";
import { Text } from "@/components/ui/Text";

type WritePanelProps = {
  text: string;
  saved: boolean;
  onChange: (text: string) => void;
};

/** "Write it" editor (design): hint, full-height text area, word count and save state. */
export function WritePanel({ text, saved, onChange }: WritePanelProps) {
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  return (
    <Panel size="lg" className="flex min-h-0 flex-1 flex-col gap-3.5 px-5.5 pt-5 pb-4">
      <Text variant="caption" className="border-b border-ink/7 pb-3.5 text-faint text-pretty">
        Write the whole case, start to end: the patient, symptoms, findings, medication and why, outcome and aftercare.
        Leave out names, dates of birth, phone numbers and addresses.
      </Text>
      <Text
        as="textarea"
        variant="editor"
        aria-label="Case study"
        value={text}
        placeholder="Start with the patient…"
        onChange={(event) => onChange(event.target.value)}
        className="min-h-40 flex-1 resize-none bg-transparent text-ink outline-none placeholder:text-faint"
      />
      <div className="flex justify-between gap-3">
        <Text as="span" variant="mono-meta" className="text-muted">
          {words} {words === 1 ? "word" : "words"}
        </Text>
        <Text as="span" variant="mono-meta" className="text-muted">
          {saved ? "Draft saved" : "Unsaved changes"}
        </Text>
      </div>
    </Panel>
  );
}
