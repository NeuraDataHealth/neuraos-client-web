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

/** The six cores, in the order the scroll highlights them (and the 3D hexes light up). */
export const cores = [
  {
    name: "Second opinion",
    description:
      "Lay out a case and get a ranked differential, with the reasoning behind each diagnosis.",
  },
  {
    name: "Case files",
    description:
      "Labs, notes and imaging reports in one thread that follows the patient across visits.",
  },
  {
    name: "Imaging",
    description:
      "Reads alongside you — flags findings on X-ray, CT and dermatology photos for you to confirm.",
  },
  {
    name: "Evidence",
    description: "Every claim links to the guideline, trial or review it came from.",
  },
  {
    name: "Stay current",
    description:
      "A weekly brief of new guidelines and trials in your specialty, summarised in minutes.",
  },
  {
    name: "Tuned to you",
    description: "Learns your specialty, your formulary and how you like answers written.",
  },
] as const;
