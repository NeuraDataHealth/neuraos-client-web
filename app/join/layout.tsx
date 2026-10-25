import { AuthProvider } from "@/components/AuthProvider";
import { Toast } from "@/components/ui/Toast";

/** Standalone invite screens: auth available, but no sign-in redirect (the page signs in itself). */
export default function JoinLayout({ children }: LayoutProps<"/join">) {
  return (
    <AuthProvider>
      {children}
      <Toast />
    </AuthProvider>
  );
}
