"use client";

import { Panel } from "@/components/ui/Panel";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { Text } from "@/components/ui/Text";
import { useChatTheme } from "@/hooks/useChatTheme";
import { CHAT_THEMES, type ChatTheme } from "@/lib/chatTheme";

/** Light, dark or match device, for this browser only; applies at once. */
export function AppearanceCard() {
  const { theme, setTheme } = useChatTheme();
  const current = CHAT_THEMES.find((option) => option.value === theme);

  return (
    <Panel className="flex flex-col gap-3 p-3">
      <SegmentedControl<ChatTheme>
        label="Appearance"
        value={theme}
        onValueChange={setTheme}
        segments={CHAT_THEMES.map(({ value, label }) => ({ value, label }))}
      />
      <Text variant="meta-md" className="px-1.5 text-muted">
        {current?.description} Saved on this browser.
      </Text>
    </Panel>
  );
}
