"use client";

import { TopBar } from "@/components/app/TopBar";
import { ChatHome } from "@/components/chat/ChatHome";
import { shortName } from "@/components/chat/messageState";
import { useProfile } from "@/hooks/account/useProfile";
import { uiPreview } from "@/lib/firebase/preview";
import { signedInUser } from "@/lib/fixtures/users";

/**
 * Container for /chat: passes the user's name to ChatHome.
 */
export function ChatHomeContainer() {
  const profile = useProfile();
  const user = uiPreview ? signedInUser : profile.data;
  const name = user?.name ? shortName(user.name) : "Doctor";

  return (
    <main id="main" className="flex min-h-0 flex-1 flex-col">
      <TopBar title="New chat" />
      <ChatHome name={name} />
    </main>
  );
}
