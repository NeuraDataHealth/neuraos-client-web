"use client";

import { useCallback, useState } from "react";
import { showToast } from "@/components/ui/toastStore";
import { api, ApiError } from "@/lib/api/client";
import type { FeedbackRating } from "@/lib/types";

export type UseFeedbackResult = {
  feedback: (aiMessageId: string, rating: FeedbackRating, reason?: string | null) => Promise<boolean>;
  submitting: boolean;
};

/**
 * Hook to submit feedback (thumbs up / down) on an AI reply.
 */
export function useFeedback(chatId: string): UseFeedbackResult {
  const [submitting, setSubmitting] = useState(false);

  const feedback = useCallback(
    async (aiMessageId: string, rating: FeedbackRating, reason?: string | null): Promise<boolean> => {
      setSubmitting(true);
      try {
        await api.messages.feedback(chatId, aiMessageId, {
          rating,
          reason: reason?.trim() ? reason.trim() : null,
        });
        showToast("Thanks for the feedback");
        return true;
      } catch (err) {
        if (err instanceof ApiError) {
          showToast(err.message);
        } else {
          showToast("Failed to submit feedback.");
        }
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [chatId],
  );

  return { feedback, submitting };
}
