import { AuthProvider } from "@/components/AuthProvider";
import { RequireAuth } from "@/components/RequireAuth";

/** Admin shell: signed-in users only. Admin pages check the admin claim; the API is the real protection. */
export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <AuthProvider>
      <RequireAuth>{children}</RequireAuth>
    </AuthProvider>
  );
}
