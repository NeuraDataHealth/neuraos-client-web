"use client";

import { clsx } from "clsx";
import { useEffect, useRef, useState, type HTMLAttributes } from "react";

type RevealKind = "default" | "device";

const animation: Record<RevealKind, string> = {
  default: "animate-reveal",
  device: "animate-reveal-device",
};

type RevealProps = HTMLAttributes<HTMLDivElement> & {
  /** `default`: 24px rise over 1s. `device`: 40px rise over 1.1s after 100ms (phone). */
  kind?: RevealKind;
};

/**
 * Fades and lifts its content in the first time 15% of it enters the viewport.
 * Stays shown afterwards.
 */
export function Reveal({ kind = "default", className, ...rest }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShown(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      data-reveal={shown ? "shown" : "pending"}
      className={clsx(shown && animation[kind], className)}
      {...rest}
    />
  );
}
