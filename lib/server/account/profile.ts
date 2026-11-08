import "server-only";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import type { UpdateProfileRequest } from "@/lib/contracts/onboarding";
import { ApiError } from "@/lib/server/http/errors";
import type { AuthUser } from "@/lib/server/http/route";
import { isDepartment, needsDepartment, trainingYears } from "@/lib/profession";
import type { UserDoc } from "@/lib/types";

/**
 * PATCH /api/profile
 *
 * Updates the signed-in user's name, role, department, year of training and answer style.
 * Contract: lib/contracts/onboarding.ts
 */
export async function updateProfile(
  user: AuthUser,
  body: UpdateProfileRequest,
): Promise<{ ok: true }> {
  const db = adminDb();
  const userRef = db.doc(`users/${user.uid}`);
  const snap = await userRef.get();

  if (!snap.exists) {
    throw new ApiError("NOT_FOUND", "User profile not found.");
  }

  const updates: Record<string, unknown> = {
    lastActiveAt: FieldValue.serverTimestamp(),
  };

  if (body.name !== undefined) {
    updates.name = body.name.trim();
  }

  if (body.specialty !== undefined) updates.specialty = body.specialty;
  if (body.profession !== undefined) updates.profession = body.profession;
  if (body.trainingYear !== undefined) updates.trainingYear = body.trainingYear;
  if (body.answerStyle !== undefined) updates.answerStyle = body.answerStyle;

  // The role, department and year must fit together after the change.
  const current = snap.data() as UserDoc;
  const profession = body.profession ?? current.profession ?? null;
  if (profession) {
    const specialty = body.specialty !== undefined ? body.specialty : current.specialty;
    const year = body.trainingYear !== undefined ? body.trainingYear : (current.trainingYear ?? null);
    const years = trainingYears(profession).length;
    if (needsDepartment(profession) && !isDepartment(specialty)) {
      throw new ApiError("INVALID_REQUEST", "Choose your department.");
    }
    if (years === 0 && year !== null) updates.trainingYear = null;
    if (years > 0 && (year === null || year > years)) {
      throw new ApiError("INVALID_REQUEST", "Choose your year of training.");
    }
  }

  await userRef.update(updates);
  return { ok: true };
}
