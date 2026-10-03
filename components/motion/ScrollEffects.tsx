"use client";

import { useEffect, useRef } from "react";

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const smoothstep = (k: number) => k * k * (3 - 2 * k);

/**
 * Scroll-linked chrome, driven by one rAF-throttled scroll listener:
 * - the 3px accent progress bar (rendered here) fills with page progress;
 * - as the footer rises, nav items fade, lift and blur out one by one
 *   (`[data-nav-item]` inside `[data-site-nav]`) and the bar fades with them;
 * - the footer's top corners flatten as it reaches the top of the viewport.
 */
export function ScrollEffects() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bar = barRef.current;
    const nav = document.querySelector<HTMLElement>("[data-site-nav]");
    const footer = document.querySelector<HTMLElement>("[data-site-footer]");
    const navItems = nav ? Array.from(nav.querySelectorAll<HTMLElement>("[data-nav-item]")) : [];
    const sheetRadius = footer ? parseFloat(getComputedStyle(footer).borderTopLeftRadius) : 0;

    let frame = 0;
    let lastFooterTop = Number.NaN;

    const update = () => {
      frame = 0;
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      if (bar) bar.style.transform = `scaleX(${scrollable > 0 ? window.scrollY / scrollable : 0})`;

      if (!footer) return;
      const footerTop = Math.round(footer.getBoundingClientRect().top);
      if (footerTop === lastFooterTop) return;
      lastFooterTop = footerTop;

      navItems.forEach((item, index) => {
        const shown = smoothstep(clamp01((footerTop - 20 - index * 22) / 150));
        item.style.opacity = String(shown);
        item.style.transform = shown < 1 ? `translateY(${(1 - shown) * -14}px)` : "";
        item.style.filter = shown < 1 ? `blur(${(1 - shown) * 4}px)` : "";
      });

      const navShown = clamp01((footerTop - 20) / 150);
      if (nav) nav.style.pointerEvents = navShown < 0.4 ? "none" : "";
      if (bar) bar.style.opacity = String(navShown);

      const radius = `${sheetRadius * clamp01(footerTop / 260)}px`;
      footer.style.borderTopLeftRadius = radius;
      footer.style.borderTopRightRadius = radius;
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
  }, []);

  return (
    <div
      ref={barRef}
      aria-hidden="true"
      className="pointer-events-none fixed top-0 left-0 z-20 h-0.75 w-full origin-left bg-accent [transform:scaleX(0)]"
    />
  );
}
