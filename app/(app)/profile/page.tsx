import type { Metadata } from "next";
import { ProfileScreen } from "@/components/account/ProfileScreen";
import { signedInUser } from "@/lib/fixtures/users";

export const metadata: Metadata = { title: "Profile — NeuraOS" };

/** Static: the fixture user. At integration: useProfile() in a client container. */
export default function ProfilePage() {
  return (
    <main id="main" className="flex min-h-0 flex-1 flex-col">
      <ProfileScreen user={signedInUser} />
    </main>
  );
}
