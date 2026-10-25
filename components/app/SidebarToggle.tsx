"use client";

import { useSidebar } from "@/components/app/sidebarContext";
import { IconButton } from "@/components/ui/IconButton";

/** Top-bar key that shows or hides the sidebar. */
export function SidebarToggle() {
  const { toggle } = useSidebar();
  return <IconButton icon="sidebar" label="Toggle sidebar" onClick={toggle} />;
}
