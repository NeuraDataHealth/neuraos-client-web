import { UserCard } from "@/components/account/UserCard";
import { Text } from "@/components/ui/Text";

/** Placeholder (Dibyanshu): chat list and new-chat button go here; UserCard stays at the bottom. */
export function ChatSidebar() {
  return (
    <div className="flex h-full flex-col justify-between gap-6 p-gutter">
      <nav aria-label="Chats">
        <Text as="h2" variant="overline" className="text-label">
          Chats
        </Text>
      </nav>
      <UserCard />
    </div>
  );
}
