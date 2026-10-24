"use client";

import { Text } from "@/components/ui/Text";
import { useAuth } from "@/hooks/useAuth";

/** Placeholder (Ashish): signed-in user's name and account actions, shown at the bottom of ChatSidebar. */
export function UserCard() {
  const { user } = useAuth();
  return (
    <Text variant="body" className="truncate text-copy">
      {user?.displayName ?? user?.email}
    </Text>
  );
}
