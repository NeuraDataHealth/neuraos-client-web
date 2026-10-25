import { AdminGate } from "@/components/admin/AdminGate";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AppSidebar } from "@/components/app/AppSidebar";
import { SidebarProvider } from "@/components/app/SidebarProvider";
import { AuthProvider } from "@/components/AuthProvider";
import { RequireAuth } from "@/components/RequireAuth";
import { Toast } from "@/components/ui/Toast";
import { adminApplications, adminContributions } from "@/lib/fixtures/admin";
import { users } from "@/lib/fixtures/users";

/** Admin shell: signed in + admin claim, 256px sidebar (overlay below 900px). Static: counts from fixtures. */
export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  const counts = {
    applications: adminApplications.filter((a) => a.status === "pending").length,
    contributions: adminContributions.filter((c) => c.status === "submitted").length,
  };
  const admin = users.find((u) => u.role === "admin");
  return (
    <AuthProvider>
      <RequireAuth>
        <AdminGate>
          <SidebarProvider>
            <div className="flex h-dvh overflow-hidden bg-(image:--gradient-app) text-ink">
              <AppSidebar width="admin" label="Admin sections">
                <AdminSidebar counts={counts} admin={{ name: admin?.name ?? "Admin" }} />
              </AppSidebar>
              <div className="relative flex min-w-0 flex-1 flex-col">{children}</div>
            </div>
            <Toast />
          </SidebarProvider>
        </AdminGate>
      </RequireAuth>
    </AuthProvider>
  );
}
