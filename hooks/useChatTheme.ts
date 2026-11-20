"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import { CHAT_THEME_STORAGE_KEY, chatThemeOf, type ChatTheme } from "@/lib/chatTheme";

const listeners = new Set<() => void>();
const darkQuery = "(prefers-color-scheme: dark)";

function readStored(): ChatTheme {
  try {
    return chatThemeOf(localStorage.getItem(CHAT_THEME_STORAGE_KEY));
  } catch {
    return "system";
  }
}

/** Sets `data-chat-theme` on <html>, the same way the head script does on load. */
function apply(theme: ChatTheme) {
  const dark = theme === "dark" || (theme === "system" && matchMedia(darkQuery).matches);
  document.documentElement.dataset.chatTheme = dark ? "dark" : "light";
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** The app's colour theme (lib/chatTheme.ts): the saved choice and a setter. */
export function useChatTheme(): { theme: ChatTheme; setTheme: (theme: ChatTheme) => void } {
  const theme = useSyncExternalStore(subscribe, readStored, () => "system" as const);

  // "Match device" follows the OS setting while the app is open.
  useEffect(() => {
    if (theme !== "system") return;
    const media = matchMedia(darkQuery);
    const onChange = () => apply("system");
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [theme]);

  const setTheme = useCallback((next: ChatTheme) => {
    try {
      localStorage.setItem(CHAT_THEME_STORAGE_KEY, next);
    } catch {
      // Private mode or blocked storage: the theme still applies until the page reloads.
    }
    apply(next);
    listeners.forEach((listener) => listener());
  }, []);

  return { theme, setTheme };
}
