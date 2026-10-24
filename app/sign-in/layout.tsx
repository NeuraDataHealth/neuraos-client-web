import { AuthProvider } from "@/components/AuthProvider";

/** Auth state for the sign-in page (owned by Dhruti; the page itself is Ashish's). */
export default function SignInLayout({ children }: LayoutProps<"/sign-in">) {
  return <AuthProvider>{children}</AuthProvider>;
}
