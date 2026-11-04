"use client";

import { useDocument } from "@/hooks/firestore/useDocument";
import { useAuth } from "@/hooks/useAuth";
import { todayKey } from "@/lib/day";
import { uiPreview } from "@/lib/firebase/preview";
import { UPLOAD_BYTES_PER_DAY, UPLOADS_PER_DAY } from "@/lib/limits";
import type { UsageDoc } from "@/lib/types";

export type UploadAllowance = {
  /** Uploads left today, all chats (reserved uploads already counted). */
  uploadsLeft: number;
  bytesLeft: number;
};

/**
 * Today's upload allowance from the user's own `usage/{uid}_{day}` doc (IST day),
 * for hints only; the server enforces it. Null while loading.
 */
export function useUploadAllowance(): UploadAllowance | null {
  const { user } = useAuth();
  const usage = useDocument<UsageDoc>(user && !uiPreview ? `usage/${user.uid}_${todayKey()}` : null);

  if (uiPreview) return { uploadsLeft: UPLOADS_PER_DAY, bytesLeft: UPLOAD_BYTES_PER_DAY };
  if (!user || usage.loading) return null;
  return {
    uploadsLeft: Math.max(0, UPLOADS_PER_DAY - (usage.data?.uploads ?? 0)),
    bytesLeft: Math.max(0, UPLOAD_BYTES_PER_DAY - (usage.data?.uploadBytes ?? 0)),
  };
}
