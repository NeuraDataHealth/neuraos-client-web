"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const LogoScene = dynamic(
  () => import("@/components/scene/LogoScene").then((mod) => mod.LogoScene),
  { ssr: false },
);

/**
 * Defers the 3D logo (three.js, its own chunk) until the browser is idle after
 * first paint, so it never competes with the hero for loading time.
 */
export function LogoSceneLoader() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(() => setReady(true), { timeout: 2000 });
      return () => window.cancelIdleCallback(id);
    }
    const id = setTimeout(() => setReady(true), 300);
    return () => clearTimeout(id);
  }, []);

  return ready ? <LogoScene /> : null;
}
