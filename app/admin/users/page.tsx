import type { Metadata } from "next";
import { TopBar } from "@/components/app/TopBar";
import { UsersScreen } from "@/components/admin/UsersScreen";
import { adminApplications, adminContributions, adminUsers } from "@/lib/fixtures/admin";
import { users } from "@/lib/fixtures/users";

export const metadata: Metadata = { title: "Users — NeuraOS admin" };

export default async function AdminUsersPage({ searchParams }: PageProps<"/admin/users">) {
  const { user } = await searchParams;
  const referrals: Record<string, string[]> = {};
  for (const u of users) if (u.referredBy) (referrals[u.referredBy] ??= []).push(u.name);

  return (
    <main id="main" className="flex min-h-0 flex-1 flex-col">
      <TopBar title="Users" subtitle={`${adminUsers.length} accounts`} />
      <div className="min-h-0 flex-1 overflow-auto px-4 pt-2 pb-14 app:px-7">
        <div className="mx-auto max-w-admin">
          <UsersScreen
            users={adminUsers}
            applications={adminApplications}
            contributions={adminContributions}
            referrals={referrals}
            initialUser={typeof user === "string" ? user : null}
          />
        </div>
      </div>
    </main>
  );
}
