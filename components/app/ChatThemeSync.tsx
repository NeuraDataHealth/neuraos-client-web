"use client";

import { useChatTheme } from "@/hooks/useChatTheme";

/** Keeps "Match device" in step with the OS setting while the app is open. Renders nothing. */
export function ChatThemeSync() {
  useChatTheme();
  return null;
}
