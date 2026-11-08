"use client";

import { useState } from "react";
import { Panel } from "@/components/ui/Panel";
import { RadioCard } from "@/components/ui/RadioCard";
import { showToast } from "@/components/ui/toastStore";
import { errorMessage } from "@/lib/api/client";
import { ANSWER_STYLES, type AnswerStyle } from "@/lib/answerStyle";

type AnswerStyleCardProps = {
  value: AnswerStyle;
  /** PATCH /api/profile with the new style. */
  onSave: (style: AnswerStyle) => Promise<void>;
};

/** How AI answers are laid out; saves as soon as an option is picked. */
export function AnswerStyleCard({ value, onSave }: AnswerStyleCardProps) {
  const [selected, setSelected] = useState(value);
  const [busy, setBusy] = useState(false);

  async function pick(style: AnswerStyle) {
    const previous = selected;
    setSelected(style);
    setBusy(true);
    try {
      await onSave(style);
      showToast("Answer style saved");
    } catch (error) {
      setSelected(previous);
      showToast(errorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Panel className="p-3">
      <fieldset className="flex flex-col gap-2" disabled={busy}>
        <legend className="sr-only">Answer style</legend>
        {ANSWER_STYLES.map((style) => (
          <RadioCard
            key={style.value}
            name="answer-style"
            value={style.value}
            title={style.label}
            description={style.description}
            checked={selected === style.value}
            onChange={() => pick(style.value)}
          />
        ))}
      </fieldset>
    </Panel>
  );
}
