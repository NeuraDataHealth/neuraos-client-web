"use client";

import { createContext, use } from "react";

export type SidebarState = {
  /** Docked sidebar on wide screens (≥ 900px); open by default. */
  docked: boolean;
  /** Overlay sidebar on narrow screens; closed by default. */
  overlay: boolean;
  toggle: () => void;
  closeOverlay: () => void;
};

export const SidebarContext = createContext<SidebarState | null>(null);

/** Sidebar open state from the nearest SidebarProvider (app and admin shells). */
export function useSidebar(): SidebarState {
  const state = use(SidebarContext);
  if (!state) throw new Error("useSidebar must be used inside <SidebarProvider>");
  return state;
}
