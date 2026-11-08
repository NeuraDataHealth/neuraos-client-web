/**
 * Who the user is, asked once at onboarding (SPEC.md section 10). The server reads it
 * from the user doc for every answer, so the system prompt fits the person asking.
 * Fixed lists only: profile text never reaches the prompt as free text.
 */

export const PROFESSIONS = [
  { value: "student", label: "Medical student (MBBS)", years: ["1st year", "2nd year", "3rd year", "Final year"] },
  { value: "intern", label: "Intern", years: [] },
  { value: "resident", label: "PG resident (MD / MS / DNB)", years: ["1st year", "2nd year", "3rd year"] },
  { value: "doctor", label: "Doctor (MBBS / general practice)", years: [] },
  { value: "specialist", label: "Specialist or consultant", years: [] },
  { value: "nurse", label: "Nurse", years: [] },
  { value: "other", label: "Other healthcare professional", years: [] },
] as const;

export type Profession = (typeof PROFESSIONS)[number]["value"];

export const PROFESSION_VALUES = PROFESSIONS.map((p) => p.value) as [Profession, ...Profession[]];

/** Departments and specialties (also used by verification, contributions and the admin filter). */
export const DEPARTMENTS = [
  "Anaesthesiology",
  "Anatomy, physiology or biochemistry",
  "Cardiology",
  "Cardiothoracic surgery",
  "Community medicine",
  "Dermatology",
  "Emergency medicine",
  "Endocrinology",
  "ENT",
  "Forensic medicine",
  "Gastroenterology",
  "General practice",
  "General surgery",
  "Internal medicine",
  "Microbiology",
  "Nephrology",
  "Neurology",
  "Neurosurgery",
  "Obstetrics",
  "Gynaecology",
  "Oncology",
  "Ophthalmology",
  "Orthopaedics",
  "Paediatrics",
  "Pathology",
  "Pharmacology",
  "Psychiatry",
  "Pulmonology",
  "Radiology",
  "Urology",
] as const;

export type Department = (typeof DEPARTMENTS)[number];

/** Residents and specialists must pick a department; everyone else may. */
export function needsDepartment(profession: Profession): boolean {
  return profession === "resident" || profession === "specialist";
}

/** Year choices for a profession (empty when it has none). */
export function trainingYears(profession: Profession): readonly string[] {
  return PROFESSIONS.find((p) => p.value === profession)?.years ?? [];
}

export function professionLabel(profession: Profession | null): string | null {
  return PROFESSIONS.find((p) => p.value === profession)?.label ?? null;
}

export function isDepartment(value: string | null | undefined): value is Department {
  return (DEPARTMENTS as readonly string[]).includes(value ?? "");
}

/** "PG resident (MD / MS / DNB) · 2nd year", or "—" before onboarding. */
export function roleLabel({ profession, trainingYear }: { profession: Profession | null; trainingYear: number | null }): string {
  const label = professionLabel(profession);
  if (!label || !profession) return "—";
  const year = trainingYear ? trainingYears(profession)[trainingYear - 1] : undefined;
  return year ? `${label} · ${year}` : label;
}
