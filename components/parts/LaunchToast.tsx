"use client";

import { clsx } from "clsx";
import { useSyncExternalStore } from "react";
import { LogoMark } from "@/components/ui/LogoMark";
import { Text } from "@/components/ui/Text";
import { brandName } from "@/lib/content";
import {
  getLaunchToast,
  getServerLaunchToast,
  subscribeLaunchToast,
} from "@/lib/launchToast";

/**
 * Bottom-centre pill: logo, platform message and a "Launching soon" tag. Rises
 * 16px and fades in, hides after 2.6s. Screen readers get the message from a
 * separate status region; the pill itself is visual only.
 */
export function LaunchToast() {
  const toast = useSyncExternalStore(subscribeLaunchToast, getLaunchToast, getServerLaunchToast);

  return (
    <>
      <div role="status" className="sr-only">
        {toast.count > 0 && (
          <Text as="span" key={toast.count} variant="toast">
            {toast.message}. Launching soon.
          </Text>
        )}
      </div>

      <div
        aria-hidden="true"
        className={clsx(
          "pointer-events-none fixed bottom-7 left-1/2 z-30 flex h-13 max-w-[calc(100vw-2rem)] -translate-x-1/2 items-center gap-3.5 whitespace-nowrap rounded-full border border-line-strong bg-linear-to-b from-key-light to-key-light-end pr-2 pl-2.5 text-ink shadow-toast [transition:opacity_var(--duration-toast-fade)_ease,translate_var(--duration-toast-move)_var(--ease-reveal)]",
          toast.visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
        )}
      >
        <LogoMark className="ml-2 block size-5.5 shrink-0" />
        <Text as="span" variant="toast" className="min-w-0 truncate">
          {toast.message || brandName}
        </Text>
        <Text
          as="span"
          variant="badge"
          className="flex h-8.5 shrink-0 items-center rounded-full border border-ink/8 bg-mist px-3.5 text-copy inset-shadow-badge"
        >
          Launching soon
        </Text>
      </div>
    </>
  );
}
