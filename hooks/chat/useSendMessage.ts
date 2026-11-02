"use client";

import { useCallback, useState } from "react";
import { showToast } from "@/components/ui/toastStore";
import { api, ApiError } from "@/lib/api/client";
import type { SendMessageRequest, SendMessageResponse } from "@/lib/contracts/messages";

export type UseSendMessageResult = {
  sendMessage: (body: SendMessageRequest) => Promise<SendMessageResponse | null>;
  sending: boolean;
  error: Error | null;
};

/**
 * Hook to send a message to a chat and trigger the AI reply when mentioned.
 */
export function useSendMessage(chatId: string): UseSendMessageResult {
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const sendMessage = useCallback(
    async (body: SendMessageRequest): Promise<SendMessageResponse | null> => {
      setSending(true);
      setError(null);
      try {
        const response = await api.messages.send(chatId, body);
        return response;
      } catch (err) {
        const parsed = err instanceof Error ? err : new Error("Failed to send message");
        setError(parsed);
        if (err instanceof ApiError) {
          showToast(err.message);
        } else {
          showToast("Failed to send message. Please try again.");
        }
        return null;
      } finally {
        setSending(false);
      }
    },
    [chatId],
  );

  return { sendMessage, sending, error };
}
