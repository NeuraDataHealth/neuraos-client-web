import type { Metadata } from "next";
import { GoogleSignInButton } from "@/components/account/GoogleSignInButton";
import { Container } from "@/components/ui/Container";
import { Text } from "@/components/ui/Text";

export const metadata: Metadata = { title: "Sign in — NeuraOS" };

export default function SignInPage() {
  return (
    <main id="main">
      <Container className="flex flex-col items-start gap-6 py-16">
        <Text as="h1" variant="heading">
          Sign in
        </Text>
        <GoogleSignInButton />
      </Container>
    </main>
  );
}
