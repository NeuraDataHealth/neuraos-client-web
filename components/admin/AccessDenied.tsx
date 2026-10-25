import NextLink from "next/link";
import { AppBrand } from "@/components/ui/AppBrand";
import { DotField } from "@/components/ui/DotField";
import { IconTile } from "@/components/ui/IconTile";
import { keyClassName, keyTextVariant } from "@/components/ui/keyStyles";
import { Text } from "@/components/ui/Text";

/** Shown to signed-in users without the admin claim (design "Admin — Access denied"). */
export function AccessDenied({ name }: { name: string | null }) {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-(image:--gradient-app) text-ink">
      <DotField focus="center" />
      <header className="relative flex h-nav shrink-0 items-center px-7">
        <AppBrand />
      </header>
      <main id="main" className="relative flex flex-1 flex-col items-center justify-center gap-3.5 px-6 pb-20 text-center">
        <IconTile icon="lock" size="lg" />
        <Text as="p" variant="badge" className="mt-2 text-muted">
          Admin
        </Text>
        <Text as="h1" variant="app-greeting" className="text-balance">
          This area is for admins
        </Text>
        <Text variant="body-lg" className="max-w-105 text-muted text-pretty">
          {name ? `You're signed in as ${name}. ` : ""}Ask a NeuraOS admin if you need access.
        </Text>
        <div className="mt-3 flex flex-wrap justify-center gap-2.5">
          <Text as={NextLink} href="/chat" variant={keyTextVariant("app-accent-lg")} className={keyClassName("app-accent-lg")}>
            Back to NeuraOS
          </Text>
          <Text as={NextLink} href="/sign-in" variant={keyTextVariant("app-light-lg")} className={keyClassName("app-light-lg")}>
            Switch account
          </Text>
        </div>
      </main>
    </div>
  );
}
