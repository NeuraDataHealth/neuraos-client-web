import { useEffect, useState, type RefObject } from "react";
import { activeIndexAt, sectionProgress } from "@/lib/coreProgress";

/**
 * Which of `count` items to highlight while the tall pinned section containing
 * `anchorRef` scrolls by. Outside the section the last highlighted item is kept.
 */
export function useActiveCore(anchorRef: RefObject<HTMLElement | null>, count: number) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const section = anchorRef.current?.closest("section");
    if (!section) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const index = activeIndexAt(sectionProgress(section, window.innerHeight), count);
      if (index !== null) setActive(index);
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
