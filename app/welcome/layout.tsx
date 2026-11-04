import { AuthProvider } from "@/components/AuthProvider";

/** Auth state for the one-time onboarding step. */
export default function WelcomeLayout({ children }: LayoutProps<"/welcome">) {
  return <AuthProvider>{children}</AuthProvider>;
}
