import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Text } from "@/components/ui/Text";

export const metadata: Metadata = { title: "Admin — NeuraOS" };

export default function AdminPage() {
  return (
    <main id="main">
      <Container className="py-16">
        <Text as="h1" variant="heading">
          Admin
        </Text>
      </Container>
    </main>
  );
}
