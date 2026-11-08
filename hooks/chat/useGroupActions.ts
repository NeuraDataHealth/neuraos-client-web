"use client";

import { useCallback, useState } from "react";
import { showToast } from "@/components/ui/toastStore";
import { api } from "@/lib/api/client";
import type { ConvertRequest } from "@/lib/contracts/groups";

export type GroupActions = {
  loading: boolean;
  error: Error | null;
  convert: (body: ConvertRequest) => Promise<{ chatId: string }>;
  createInvite: () => Promise<string>;
  revokeInvite: () => Promise<void>;
  leave: (deleteMyFiles: boolean) => Promise<void>;
  removeMember: (uid: string) => Promise<void>;
};

/**
 * Group management actions for a chat: convert to group, invite token rotate/revoke,
 * leave, and member removal.
 */
export function useGroupActions(chatId: string): GroupActions {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const convert = useCallback(
    async (body: ConvertRequest) => {
      setLoading(true);
      setError(null);
      try {
        return await api.groups.convert(chatId, body);
      } catch (err) {
        const e = err instanceof Error ? err : new Error(String(err));
        setError(e);
        showToast(e.message);
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [chatId]
  );

  const createInvite = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.groups.createInvite(chatId);
      return res.token;
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      showToast(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [chatId]);

  const revokeInvite = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await api.groups.revokeInvite(chatId);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      showToast(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [chatId]);

  const leave = useCallback(
    async (deleteMyFiles: boolean) => {
      setLoading(true);
      setError(null);
      try {
        await api.groups.leave(chatId, { deleteMyFiles });
      } catch (err) {
        const e = err instanceof Error ? err : new Error(String(err));
        setError(e);
        showToast(e.message);
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [chatId]
  );

  const removeMember = useCallback(
    async (uid: string) => {
      setLoading(true);
      setError(null);
      try {
        await api.groups.removeMember(chatId, uid);
      } catch (err) {
        const e = err instanceof Error ? err : new Error(String(err));
        setError(e);
        showToast(e.message);
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [chatId]
  );

  return { loading, error, convert, createInvite, revokeInvite, leave, removeMember };
}
