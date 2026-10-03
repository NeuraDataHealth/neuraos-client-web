"use client";

import { useEffect, useRef } from "react";
import { startLogoScene } from "@/lib/scene/run";

/** Full-viewport layer behind the page that hosts the 3D logo canvas. */
export function LogoScene() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    return startLogoScene(host, { reducedMotion });
  }, []);

  return (
    <div
      ref={hostRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    />
  );
}
