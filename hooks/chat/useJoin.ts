"use client";

import { useCallback, useEffect, useState } from "react";
import type { JoinState } from "@/components/groups/JoinScreen";
import { api } from "@/lib/api/client";
import type { JoinPreviewResponse } from "@/lib/contracts/groups";

export type UseJoin = {
  state: JoinState;
  preview: JoinPreviewResponse | null;
  loading: boolean;
  joining: boolean;
  error: Error | null;
  join: () => Promise<string>;
};

/**
 * Handles group invite preview and join flow:
 * 1. Checks preview info from GET /api/join/:token
 * 2. Derives state: signedOut | ready | full | expired | member | joined
 * 3. Joins the group via POST /api/join/:token
 */
export function useJoin(token: string, signedIn: boolean): UseJoin {
  const [preview, setPreview] = useState<JoinPreviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!signedIn) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const res = await api.groups.preview(token);
        if (!cancelled) setPreview(res);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [token, signedIn]);

  const join = useCallback(async () => {
    setJoining(true);
    setError(null);
    try {
      const res = await api.groups.join(token);
      setJoined(true);
      return res.chatId;
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      throw e;
    } finally {
      setJoining(false);
    }
  }, [token]);

  let state: JoinState = "ready";
  if (!signedIn) {
    state = "signedOut";
  } else if (joined) {
    state = "joined";
  } else if (error || (preview && !preview.isActive)) {
    state = "expired";
  } else if (preview?.isMember) {
    state = "member";
  } else if (preview?.isFull) {
    state = "full";
  }

  return { state, preview, loading, joining, error, join };
}
