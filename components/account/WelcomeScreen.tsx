"use client";

import { useState } from "react";
import { roleBody, roleProblem, type RoleDraft } from "@/components/account/roleDraft";
import { RoleSelectRows } from "@/components/account/RoleSelectRows";
import { Button } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Panel";
import { RadioCard } from "@/components/ui/RadioCard";
import { Text } from "@/components/ui/Text";
import type { UpdateProfileRequest } from "@/lib/contracts/onboarding";
import { needsDepartment, PROFESSIONS, trainingYears, type Profession } from "@/lib/profession";

type WelcomeScreenProps = {
  firstName: string;
  /** PATCH /api/profile with the role fields. */
  onSave: (body: UpdateProfileRequest) => Promise<void>;
};

/** One-time onboarding step after the first sign-in: role, department and year. */
export function WelcomeScreen({ firstName, onSave }: WelcomeScreenProps) {
  const [draft, setDraft] = useState<RoleDraft>({ profession: "", specialty: "", trainingYear: null });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const showDetails =
    draft.profession !== "" && (needsDepartment(draft.profession) || trainingYears(draft.profession).length > 0);

  async function submit() {
    const problem = roleProblem(draft);
    if (problem) return setError(problem);
    setBusy(true);
    setError(null);
    try {
      await onSave(roleBody(draft));
    } catch {
      setError("That didn't save. Please try again.");
      setBusy(false);
    }
  }

  return (
    <form
      className="mt-1 flex w-full max-w-card flex-col gap-5.5 rounded-sheet-sm border border-ink/8 bg-paper px-7 pt-7 pb-6.5 shadow-sheet"
      onSubmit={(event) => {
        event.preventDefault();
        void submit();
      }}
    >
      <div className="flex flex-col items-center gap-2.5 text-center">
        <Text as="p" variant="badge" className="text-muted">
          One quick step
        </Text>
        <Text as="h1" variant="status-title" className="text-balance">
          Welcome, {firstName}
        </Text>
        <Text variant="body" className="max-w-80 text-muted text-pretty">
          NeuraOS pitches its answers to your training. You can change this later on your profile.
        </Text>
      </div>

      <fieldset className="flex flex-col gap-2">
        <Text as="legend" variant="field-label" className="mb-2 text-muted">
          I am a
        </Text>
        {PROFESSIONS.map((p) => (
          <RadioCard
            key={p.value}
            name="profession"
            value={p.value}
            title={p.label}
            checked={draft.profession === p.value}
            onChange={() => setDraft({ ...draft, profession: p.value as Profession, trainingYear: null })}
          />
        ))}
      </fieldset>

      {showDetails && (
        <Panel divided>
          <RoleSelectRows draft={draft} onChange={setDraft} showRole={false} />
        </Panel>
      )}

      {error && (
        <Text role="alert" variant="body-sm" className="text-center text-danger-text">
          {error}
        </Text>
      )}
      <Button type="submit" look="app-accent-xl" className="w-full" disabled={busy}>
        {busy ? "Saving…" : "Continue"}
      </Button>
    </form>
  );
}
