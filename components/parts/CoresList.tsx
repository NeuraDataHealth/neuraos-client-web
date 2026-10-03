"use client";

import { clsx } from "clsx";
import { useRef } from "react";
import { Text } from "@/components/ui/Text";
import { useActiveCore } from "@/hooks/useActiveCore";
import { cores } from "@/lib/content";

/**
 * The six cores. The one matching the scroll position gets the accent bar, full
 * ink and its description; the rest dim. Descriptions stay in the DOM (screen
 * readers get all six) and only collapse visually.
 */
export function CoresList() {
  const listRef = useRef<HTMLOListElement>(null);
  const active = useActiveCore(listRef, cores.length);

  return (
    <ol ref={listRef} className="flex flex-col">
      {cores.map((core, index) => {
        const isActive = index === active;
        return (
          <li
            key={core.name}
            aria-current={isActive ? "true" : undefined}
            className={clsx(
              "grid grid-cols-[2.25rem_1fr] gap-x-3 gap-y-1 border-l-2 py-3.25 pl-3.5 transition-colors duration-(--duration-state)",
              isActive ? "border-accent" : "border-line",
            )}
          >
            <Text as="span" variant="mono-sm" className="text-faint">
              {String(index + 1).padStart(2, "0")}
            </Text>
            <Text
              as="h3"
              variant="title"
              className={clsx(
                "transition-colors duration-(--duration-state)",
                isActive ? "text-ink" : "text-ghost",
              )}
            >
              {core.name}
            </Text>
            <div
              className={clsx(
                "col-start-2 grid transition-[grid-template-rows,opacity] duration-(--duration-state) ease-reveal",
                isActive ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
              )}
            >
              <Text variant="body" className="min-h-0 overflow-hidden text-copy">
                {core.description}
              </Text>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
