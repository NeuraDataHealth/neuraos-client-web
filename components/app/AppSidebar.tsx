"use client";

import { clsx } from "clsx";
import { usePathname } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useSidebar } from "@/components/app/sidebarContext";

type AppSidebarProps = {
  /** `chat` 280px, `admin` 256px. */
  width?: "chat" | "admin";
  label: string;
  children: ReactNode;
};

/**
 * Docked column on wide screens; on narrow screens an overlay with a scrim
 * that closes on navigation, Esc or a tap outside.
 */
export function AppSidebar({ width = "chat", label, children }: AppSidebarProps) {
  const { docked, overlay, closeOverlay } = useSidebar();
  const pathname = usePathname();

  useEffect(() => closeOverlay(), [pathname, closeOverlay]);

  useEffect(() => {
    if (!overlay) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && closeOverlay();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [overlay, closeOverlay]);

  return (
    <>
      {overlay && (
        <div aria-hidden="true" onClick={closeOverlay} className="fixed inset-0 z-25 bg-ink/28 app:hidden" />
      )}
      <aside
        aria-label={label}
        className={clsx(
          "h-dvh shrink-0 flex-col border-r border-ink/7 bg-linear-to-b from-panel to-panel-end",
          width === "chat" ? "w-sidebar" : "w-sidebar-admin",
          // Narrow: overlay when opened. Wide: docked unless collapsed.
          overlay ? "fixed inset-y-0 left-0 z-30 flex shadow-drawer" : "hidden",
          "app:static app:z-auto app:shadow-none",
          docked ? "app:flex" : "app:hidden",
        )}
      >
        {children}
      </aside>
    </>
  );
}
