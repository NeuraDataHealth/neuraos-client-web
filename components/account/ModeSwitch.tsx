"use client";

import { useRouter } from "next/navigation";
import { SegmentedControl } from "@/components/ui/SegmentedControl";

type Mode = "assistant" | "train";

/** The design's app mode switch: Assistant (chats) or Train NeuraOS (case studies). */
export function ModeSwitch({ mode }: { mode: Mode }) {
  const router = useRouter();
  return (
    <SegmentedControl<Mode>
      label="App mode"
      value={mode}
      onValueChange={(next) => router.push(next === "train" ? "/contribute" : "/chat")}
      segments={[
        { value: "assistant", label: "Assistant", icon: "chat" },
        { value: "train", label: "Train NeuraOS", icon: "contributions" },
      ]}
    />
  );
}
