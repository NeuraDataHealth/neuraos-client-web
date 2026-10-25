"use client";

import { useSyncExternalStore } from "react";
import { Text } from "@/components/ui/Text";
import { getServerToast, getToast, subscribeToast } from "@/components/ui/toastStore";

/** Dark pill at the bottom centre; render once per layout and call showToast(). */
export function Toast() {
  const toast = useSyncExternalStore(subscribeToast, getToast, getServerToast);
  return (
    <div role="status" aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-7 z-60 flex justify-center px-4">
      {toast && (
        <Text
          key={toast.id}
          as="p"
          variant="button-sm"
          className="flex h-11 max-w-full animate-reveal items-center gap-2.5 truncate rounded-full bg-linear-to-b from-key-dark to-ink px-4.5 text-on-dark shadow-dark-toast"
        >
          <span aria-hidden="true" className="size-1.75 shrink-0 rounded-full bg-accent-hi" />
          {toast.text}
        </Text>
      )}
    </div>
  );
}
