"use client";

import { clsx } from "clsx";
import { useEffect, useRef, useState, type HTMLAttributes } from "react";

type RevealProps = HTMLAttributes<HTMLDivElement>;

/**
 * Fades and lifts its content in the first time 15% of it enters the viewport
 * (design: opacity + 24px rise, 1s). Stays shown afterwards.
 */
export function Reveal({ className, ...rest }: RevealProps) {
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
      className={clsx(shown && "animate-reveal", className)}
      {...rest}
    />
  );
}
