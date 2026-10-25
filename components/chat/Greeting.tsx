"use client";

import { useNow } from "@/components/chat/useNow";
import { Text } from "@/components/ui/Text";

/** "Good morning, Dr. Mehta." by the viewer's local time, then "Which case today?". */
export function Greeting({ name }: { name: string }) {
  const now = useNow(60_000);
  const hour = now === null ? null : new Date(now).getHours();
  const part = hour === null ? "Hello" : hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  return (
    <Text as="p" variant="app-greeting" className="mt-3 text-center text-balance">
      {part}, {name}.
      <br />
      <span className="text-faint">Which case today?</span>
    </Text>
  );
}
