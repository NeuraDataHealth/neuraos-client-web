"use client";

import { SettingsScreen } from "@/components/admin/SettingsScreen";
import { PageStatus } from "@/components/app/PageStatus";
import { useConfig } from "@/hooks/admin/useConfig";
import { useSpend } from "@/hooks/admin/useSpend";

/** Client side of admin settings: live `config/app`. */
export function SettingsContainer() {
  const config = useConfig();
  const spend = useSpend();
  if (!config.data) {
    return <PageStatus error={config.error} label={config.loading ? "Loadingâ€¦" : "No config/app document yet. Run bun run seed:config."} />;
  }
  return <SettingsScreen key={JSON.stringify(config.data)} config={config.data} spendToday={spend.data ? spend.data.spendUsd : null} onSave={config.update} />;
}
