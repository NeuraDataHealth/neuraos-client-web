import type { Metadata, Viewport } from "next";
import { clsx } from "clsx";
import { Backdrop } from "@/components/ui/Backdrop";
import { Text } from "@/components/ui/Text";
import { fontVariables } from "@/styles/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "NeuraOS — A second opinion, always on call",
  description:
    "NeuraOS is a medical AI assistant for clinicians. Bring it a case — it reasons through the differential, cites the evidence, and keeps you current in your field.",
};

export const viewport: Viewport = {
  // Browser chrome matches the page (--color-paper).
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={clsx(fontVariables, "antialiased")}>
      <body className="min-h-dvh">
        <Text
          as="a"
          href="#main"
          variant="button-sm"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-full focus:bg-ink focus:px-4 focus:py-3 focus:text-paper"
        >
          Skip to content
        </Text>
        <Backdrop />
        {children}
      </body>
    </html>
  );
}
