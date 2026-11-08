import { FieldSelectRow } from "@/components/ui/FieldSelectRow";
import type { RoleDraft } from "@/components/account/roleDraft";
import { DEPARTMENTS, needsDepartment, PROFESSIONS, trainingYears, type Department, type Profession } from "@/lib/profession";

type RoleSelectRowsProps = {
  draft: RoleDraft;
  onChange: (draft: RoleDraft) => void;
  /** The Welcome screen picks the role with cards, so it hides this row. */
  showRole?: boolean;
};

/** Role, department and year rows for a divided Panel (profile page and Welcome screen). */
export function RoleSelectRows({ draft, onChange, showRole = true }: RoleSelectRowsProps) {
  const years = draft.profession ? trainingYears(draft.profession) : [];
  const departmentRequired = draft.profession ? needsDepartment(draft.profession) : false;

  return (
    <>
      {showRole && (
        <FieldSelectRow
          label="Role"
          value={draft.profession}
          onChange={(event) => onChange({ ...draft, profession: event.target.value as Profession, trainingYear: null })}
        >
          <option value="">Choose your role</option>
          {PROFESSIONS.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </FieldSelectRow>
      )}
      <FieldSelectRow
        label={departmentRequired ? "Department" : "Department (optional)"}
        value={draft.specialty}
        onChange={(event) => onChange({ ...draft, specialty: event.target.value as Department | "" })}
      >
        <option value="">{departmentRequired ? "Choose your department" : "None"}</option>
        {DEPARTMENTS.map((d) => (
          <option key={d}>{d}</option>
        ))}
      </FieldSelectRow>
      {years.length > 0 && (
        <FieldSelectRow
          label="Year"
          value={draft.trainingYear ?? ""}
          onChange={(event) => onChange({ ...draft, trainingYear: event.target.value ? Number(event.target.value) : null })}
        >
          <option value="">Choose your year</option>
          {years.map((label, i) => (
            <option key={label} value={i + 1}>
              {label}
            </option>
          ))}
        </FieldSelectRow>
      )}
    </>
  );
}
