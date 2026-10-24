import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Text } from "@/components/ui/Text";

export const metadata: Metadata = { title: "Profile — NeuraOS" };

export default function ProfilePage() {
  return (
    <main id="main">
      <Container className="py-16">
        <Text as="h1" variant="heading">
          Profile
        </Text>
      </Container>
    </main>
  );
}
