import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Text } from "@/components/ui/Text";

export const metadata: Metadata = { title: "Doctor verification — NeuraOS" };

export default function VerifyPage() {
  return (
    <main id="main">
      <Container className="py-16">
        <Text as="h1" variant="heading">
          Doctor verification
        </Text>
      </Container>
    </main>
  );
}
