"use client";

import { useCallback, useState } from "react";
import { showToast } from "@/components/ui/toastStore";
import { api, ApiError } from "@/lib/api/client";
import type { RetryMessageResponse } from "@/lib/contracts/messages";

export type UseRetryResult = {
  retry: (aiMessageId: string) => Promise<RetryMessageResponse | null>;
  retrying: boolean;
  error: Error | null;
};

/**
 * Hook to retry a failed or stale streaming AI reply.
 */
export function useRetry(chatId: string): UseRetryResult {
  const [retrying, setRetrying] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const retry = useCallback(
    async (aiMessageId: string): Promise<RetryMessageResponse | null> => {
      setRetrying(true);
      setError(null);
      try {
        const response = await api.messages.retry(chatId, aiMessageId);
        return response;
      } catch (err) {
        const parsed = err instanceof Error ? err : new Error("Failed to retry reply");
        setError(parsed);
        if (err instanceof ApiError) {
          showToast(err.message);
        } else {
          showToast("Failed to retry message.");
        }
        return null;
      } finally {
        setRetrying(false);
      }
    },
    [chatId],
  );

  return { retry, retrying, error };
}
