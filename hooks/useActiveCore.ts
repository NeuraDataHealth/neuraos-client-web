import { useEffect, useState, type RefObject } from "react";

/**
 * Which of `count` items to highlight while a tall pinned section scrolls by.
 * Progress runs 0 → 1 from the section's top meeting the viewport top to its
 * bottom meeting the viewport bottom, split into equal bands (as in the design).
 * Outside the section the last highlighted item is kept.
 */
export function useActiveCore(anchorRef: RefObject<HTMLElement | null>, count: number) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const section = anchorRef.current?.closest("section");
    if (!section) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const { top, height } = section.getBoundingClientRect();
      const progress = -top / Math.max(1, height - window.innerHeight);
      if (progress <= -0.2 || progress >= 1.05) return;
      setActive(Math.min(count - 1, Math.floor(Math.max(0, progress) * count)));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [anchorRef, count]);

  return active;
}
