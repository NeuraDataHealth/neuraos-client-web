import type { Metadata } from "next";
import { SettingsScreen } from "@/components/admin/SettingsScreen";
import { adminConfig, spendTodayUsd } from "@/lib/fixtures/admin";

export const metadata: Metadata = { title: "Settings — NeuraOS admin" };

export default function AdminSettingsPage() {
  return (
    <main id="main" className="flex min-h-0 flex-1 flex-col">
      <SettingsScreen config={adminConfig} spendToday={spendTodayUsd} />
    </main>
  );
}
