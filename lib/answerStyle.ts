/**
 * How AI answers are laid out, chosen by each user in Profile (SPEC.md section 7).
 * Fixed list only: the server reads the value from the user doc and maps it to fixed
 * prompt text, so nothing the user types reaches the system prompt.
 */

export const ANSWER_STYLES = [
  {
    value: "concise",
    label: "Concise",
    description: "A one-line answer, then numbered points with the key numbers.",
  },
  {
    value: "detailed",
    label: "Detailed",
    description: "Sections with the reasoning, differentials, workup and tables.",
  },
  {
    value: "exam",
    label: "Exam notes",
    description: "High-yield numbered points, mnemonics and common exam traps.",
  },
] as const;

export type AnswerStyle = (typeof ANSWER_STYLES)[number]["value"];

export const ANSWER_STYLE_VALUES = ANSWER_STYLES.map((s) => s.value) as [AnswerStyle, ...AnswerStyle[]];

/** Used until the user picks one (and for users from before the setting existed). */
export const DEFAULT_ANSWER_STYLE: AnswerStyle = "concise";

export function answerStyleOf(value: string | null | undefined): AnswerStyle {
  return ANSWER_STYLES.find((s) => s.value === value)?.value ?? DEFAULT_ANSWER_STYLE;
}
