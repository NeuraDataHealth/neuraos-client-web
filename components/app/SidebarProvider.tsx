"use client";

import { useCallback, useMemo, useState, type ReactNode } from "react";
import { SidebarContext, type SidebarState } from "@/components/app/sidebarContext";

/** Matches the `app:` breakpoint in globals.css (900px). */
const WIDE = "(min-width: 56.25rem)";

/**
 * Keeps the docked (wide) and overlay (narrow) states apart, so CSS can pick
 * the right default on first paint without a flash: docked on wide screens,
 * hidden behind the toggle on narrow ones (as designed).
 */
export function SidebarProvider({ children }: { children: ReactNode }) {
  const [docked, setDocked] = useState(true);
  const [overlay, setOverlay] = useState(false);

  const toggle = useCallback(() => {
    if (window.matchMedia(WIDE).matches) setDocked((open) => !open);
    else setOverlay((open) => !open);
  }, []);
  const closeOverlay = useCallback(() => setOverlay(false), []);

  const value = useMemo<SidebarState>(
    () => ({ docked, overlay, toggle, closeOverlay }),
    [docked, overlay, toggle, closeOverlay],
  );
  return <SidebarContext value={value}>{children}</SidebarContext>;
}
