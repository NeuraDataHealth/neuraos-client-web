/**
 * Colour theme of the signed-in app (chat, profile, verify, contribute). The landing page,
 * sign-in and admin always stay light. Stored per browser; the dark tokens live in
 * app/globals.css under `html[data-chat-theme="dark"] [data-chat-shell]`.
 */
export const CHAT_THEMES = [
  { value: "light", label: "Light", description: "Dark text on a white page." },
  { value: "dark", label: "Dark", description: "Light text on a dark page, easier at night." },
  { value: "system", label: "Match device", description: "Follows your phone or computer setting." },
] as const;

export type ChatTheme = (typeof CHAT_THEMES)[number]["value"];

export const CHAT_THEME_STORAGE_KEY = "neuraos-chat-theme";

export function chatThemeOf(value: unknown): ChatTheme {
  return value === "light" || value === "dark" || value === "system" ? value : "system";
}

/**
 * Runs in <head> before the first paint (app/layout.tsx), so a dark app never flashes white.
 * Sets `data-chat-theme` on <html> to "light" or "dark".
 */
export const chatThemeScript = `(function(){try{var t=localStorage.getItem(${JSON.stringify(CHAT_THEME_STORAGE_KEY)});var d=t==="dark"||(t!=="light"&&matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.dataset.chatTheme=d?"dark":"light";}catch(e){}})();`;
