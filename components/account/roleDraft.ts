import type { UpdateProfileRequest } from "@/lib/contracts/onboarding";
import { isDepartment, needsDepartment, trainingYears, type Department, type Profession } from "@/lib/profession";
import type { UserDoc } from "@/lib/types";

/** Role, department and year while they are being edited ("" = not chosen). */
export type RoleDraft = { profession: Profession | ""; specialty: Department | ""; trainingYear: number | null };

export function roleDraftFrom(user: Pick<UserDoc, "profession" | "specialty" | "trainingYear">): RoleDraft {
  return {
    profession: user.profession ?? "",
    specialty: isDepartment(user.specialty) ? user.specialty : "",
    trainingYear: user.trainingYear ?? null,
  };
}

/** What is still missing, or null when the draft can be saved. */
export function roleProblem(draft: RoleDraft): string | null {
  if (!draft.profession) return "Choose your role.";
  if (needsDepartment(draft.profession) && !draft.specialty) return "Choose your department.";
  const years = trainingYears(draft.profession).length;
  if (years > 0 && (draft.trainingYear === null || draft.trainingYear > years)) return "Choose your year.";
  return null;
}

/** The PATCH /api/profile fields for a complete draft. */
export function roleBody(draft: RoleDraft): Pick<UpdateProfileRequest, "profession" | "specialty" | "trainingYear"> {
  const profession = draft.profession || undefined;
  const hasYears = profession ? trainingYears(profession).length > 0 : false;
  return {
    profession,
    specialty: draft.specialty || null,
    trainingYear: hasYears ? draft.trainingYear : null,
  };
}
