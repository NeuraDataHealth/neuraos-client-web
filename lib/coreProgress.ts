/**
 * Progress through a tall pinned section: 0 when its top meets the viewport
 * top, 1 when its bottom meets the viewport bottom.
 */
export function sectionProgress(section: Element, viewportHeight: number) {
  const { top, height } = section.getBoundingClientRect();
  return -top / Math.max(1, height - viewportHeight);
}

/**
 * Which of `count` equal bands `progress` falls in, or null when the section
 * is out of range (design: slightly before it starts until just after it ends).
 */
export function activeIndexAt(progress: number, count: number): number | null {
  if (progress <= -0.2 || progress >= 1.05) return null;
  return Math.min(count - 1, Math.floor(Math.max(0, progress) * count));
}
