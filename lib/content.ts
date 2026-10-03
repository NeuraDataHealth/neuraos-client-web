/** Site copy and links. Placeholder `#` targets wait on real URLs (see PROGRESS.md). */

export const brandName = "NeuraOS";

export const navLinks = [
  { label: "Cores", href: "#cores" },
  { label: "Privacy", href: "#private" },
  { label: "App", href: "#app" },
] as const;

export const getAppLink = { label: "Get the app", href: "#get" } as const;
