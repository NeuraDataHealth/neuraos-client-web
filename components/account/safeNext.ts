/** `?next=` as a same-site path only, so it can't send people to another site. */
export function safeNext(fallback = "/chat"): string {
  const next = new URLSearchParams(window.location.search).get("next");
  return next?.startsWith("/") && !next.startsWith("//") ? next : fallback;
}
