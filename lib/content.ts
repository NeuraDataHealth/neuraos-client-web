/** Site copy and links. Placeholder `#` targets wait on real URLs (see PROGRESS.md). */

export const brandName = "NeuraOS";

/** Section anchors: the ids sections render and the hrefs links point at. */
export const sectionIds = {
  top: "top",
  cores: "cores",
  privacy: "private",
  app: "app",
  get: "get",
} as const;

export const navLinks = [
  { label: "Cores", href: `#${sectionIds.cores}` },
  { label: "Privacy", href: `#${sectionIds.privacy}` },
  { label: "App", href: `#${sectionIds.app}` },
] as const;

export const getAppLink = { label: "Get the app", href: `#${sectionIds.get}` } as const;
