"use client";

import { useEffect, useRef } from "react";
import { startBadgeLogo } from "@/lib/scene/badge";

type HexBadgeProps = {
  /** Share of the host's height the logo fills (design: 0.8). */
  fill?: number;
};

/** Host for the black 3D logo; fills its positioned parent. */
export function HexBadge({ fill = 0.8 }: HexBadgeProps) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    return startBadgeLogo(host, { reducedMotion, fill });
  }, [fill]);

  return <div ref={hostRef} aria-hidden="true" className="absolute inset-0" />;
}
