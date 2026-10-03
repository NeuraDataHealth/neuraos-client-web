"use client";

import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { useEffect } from "react";

const SKIP_LINK_HASH = "#main";
const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);

/** Moves keyboard focus to an anchor target without scrolling to it again. */
function focusTarget(target: HTMLElement) {
  if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
  target.focus({ preventScroll: true });
}

/**
 * Lenis smooth scrolling (design settings) plus eased in-page anchor jumps.
 * Off when the user prefers reduced motion: native scroll and native anchors.
 */
export function SmoothScroll() {
  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let lenis: Lenis | null = null;

    const start = () => {
      if (reducedMotion.matches) return;
      lenis = new Lenis({
        autoRaf: true,
        lerp: 0.075,
        smoothWheel: true,
        wheelMultiplier: 0.9,
        touchMultiplier: 1.4,
      });
    };
    const stop = () => {
      lenis?.destroy();
      lenis = null;
    };
    const restart = () => {
      stop();
      start();
    };

    const onClick = (event: MouseEvent) => {
      if (!lenis || event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.target instanceof Element ? event.target.closest("a[href^='#']") : null;
      const hash = link?.getAttribute("href");
      // The skip link keeps the browser's native jump-and-focus behaviour.
      if (!hash || hash === SKIP_LINK_HASH) return;

      const target = hash === "#" ? null : document.getElementById(hash.slice(1));
      if (hash !== "#" && !target) return;
      event.preventDefault();

      // detail 0 = activated from the keyboard: hand focus over once we arrive.
      const fromKeyboard = event.detail === 0;
      lenis.scrollTo(target ?? 0, {
        duration: 1.6,
        easing: easeOutQuart,
        onComplete: () => {
          if (fromKeyboard && target) focusTarget(target);
        },
      });
    };

    start();
    reducedMotion.addEventListener("change", restart);
    document.addEventListener("click", onClick);
    return () => {
      reducedMotion.removeEventListener("change", restart);
      document.removeEventListener("click", onClick);
      stop();
    };
  }, []);

  return null;
}
