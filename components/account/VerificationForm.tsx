"use client";

import { useEffect, useRef, useState } from "react";
import { COUNCILS, SPECIALTIES } from "@/components/account/options";
import { UploadTile } from "@/components/account/UploadTile";
import type { FileChipStatus } from "@/components/chat/FileChip";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { FieldRow } from "@/components/ui/FieldRow";
import { FieldSelectRow } from "@/components/ui/FieldSelectRow";
import { Notice } from "@/components/ui/Notice";
import { Panel } from "@/components/ui/Panel";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Text } from "@/components/ui/Text";
import { submitVerificationRequestSchema, type SubmitVerificationRequest } from "@/lib/contracts/verification";
import type { VerificationDocumentKind } from "@/lib/types";

type Fields = Omit<SubmitVerificationRequest, "documents" | "registrationYear"> & { registrationYear: string };
type Doc = { name: string; status: FileChipStatus };

type VerificationFormProps = {
  initial: Fields;
  onSubmit: (request: SubmitVerificationRequest) => void;
  submitLabel: string;
};

const docs: { kind: VerificationDocumentKind; label: string; hint: string }[] = [
  { kind: "registration_certificate", label: "Registration certificate", hint: "PDF or photo, up to 10 MB" },
  { kind: "id_proof", label: "ID proof", hint: "Government ID, front side, up to 10 MB" },
];

/**
 * Doctor verification application. Validated with the API's own zod schema.
 * Static: uploads finish after a short delay; at integration they use
 * api.verification.uploadUrl + uploadToTarget.
 */
export function VerificationForm({ initial, onSubmit, submitLabel }: VerificationFormProps) {
  const [fields, setFields] = useState(initial);
  const [files, setFiles] = useState<Partial<Record<VerificationDocumentKind, Doc>>>({});
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  const set = (key: keyof Fields) => (event: { target: { value: string } }) =>
    setFields((f) => ({ ...f, [key]: event.target.value }));

  function pick(kind: VerificationDocumentKind, file: File) {
    setFiles((f) => ({ ...f, [kind]: { name: file.name, status: "uploading" } }));
    timers.current.push(
      setTimeout(() => setFiles((f) => (f[kind] ? { ...f, [kind]: { ...f[kind], status: "ready" } } : f)), 1400),
    );
  }

  function submit() {
    const documents = docs.flatMap(({ kind }) => {
      const doc = files[kind];
      return doc?.status === "ready" ? [{ kind, fileName: doc.name, gcsUri: `gs://static/verification/${doc.name}` }] : [];
    });
    const result = submitVerificationRequestSchema.safeParse({
      ...fields,
      registrationYear: Number(fields.registrationYear),
      documents,
    });
    const problems = result.success ? [] : [...new Set(result.error.issues.map((i) => describe(i.path[0], i.message)))];
    if (!consent) problems.push("Confirm that the details are yours and accurate.");
    setErrors(problems);
    if (result.success && consent) onSubmit(result.data);
  }

  return (
    <form
      noValidate
      className="flex flex-col gap-7"
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <section aria-labelledby="verify-details">
        <SectionLabel id="verify-details">Your details</SectionLabel>
        <Panel divided>
          <FieldRow label="Full name, as registered" value={fields.fullName} onChange={set("fullName")} autoComplete="name" />
          <FieldRow label="Phone" value={fields.phone} onChange={set("phone")} type="tel" autoComplete="tel" inputMode="tel" />
          <FieldSelectRow label="Specialty" value={fields.specialty} onChange={set("specialty")}>
            <option value="">Choose a specialty</option>
            {SPECIALTIES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </FieldSelectRow>
          <FieldRow label="Hospital / clinic" value={fields.institution} onChange={set("institution")} autoComplete="organization" />
          <FieldRow label="Registration number" value={fields.registrationNumber} onChange={set("registrationNumber")} />
          <FieldSelectRow label="Medical council" value={fields.councilName} onChange={set("councilName")}>
            <option value="">Choose a council</option>
            {COUNCILS.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </FieldSelectRow>
          <FieldRow
            label="Year of registration"
            value={fields.registrationYear}
            onChange={set("registrationYear")}
            inputMode="numeric"
            maxLength={4}
          />
        </Panel>
      </section>

      <section aria-labelledby="verify-documents">
        <SectionLabel id="verify-documents">Documents</SectionLabel>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,16rem),1fr))] gap-3.5">
          {docs.map((doc) => (
            <UploadTile
              key={doc.kind}
              label={doc.label}
              hint={doc.hint}
              file={files[doc.kind] ?? null}
              onPick={(file) => pick(doc.kind, file)}
              onRemove={() => setFiles((f) => ({ ...f, [doc.kind]: undefined }))}
            />
          ))}
        </div>
      </section>

      <Checkbox checked={consent} onChange={(event) => setConsent(event.target.checked)}>
        <Text as="span" variant="body" className="text-ink-soft">
          These details are mine and accurate. NeuraOS checks them against the medical council register and keeps the
          documents only for verification.
        </Text>
      </Checkbox>

      {errors.length > 0 && (
        <div role="alert">
          <Notice tone="warning">
            <ul className="flex flex-col gap-1">
              {errors.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          </Notice>
        </div>
      )}

      <Button look="app-accent-lg" type="submit" className="self-end">
        {submitLabel}
      </Button>
    </form>
  );
}

const labels: Record<string, string> = {
  fullName: "Full name",
  phone: "Phone",
  specialty: "Specialty",
  institution: "Hospital / clinic",
  registrationNumber: "Registration number",
  councilName: "Medical council",
  registrationYear: "Year of registration",
};

/** "Phone: check this field" style messages; documents keep the schema's own message. */
function describe(field: PropertyKey | undefined, message: string): string {
  if (field === "documents") return message.startsWith("Upload") ? message : "Upload a registration certificate and an ID proof.";
  const label = typeof field === "string" ? labels[field] : undefined;
  return label ? `${label}: add a valid value.` : message;
}
