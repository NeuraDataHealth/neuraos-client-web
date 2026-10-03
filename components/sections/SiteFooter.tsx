import { NewsletterForm } from "@/components/parts/NewsletterForm";
import { Container } from "@/components/ui/Container";
import { Link } from "@/components/ui/Link";
import { LogoMark } from "@/components/ui/LogoMark";
import { Text } from "@/components/ui/Text";
import { brandName, footerColumns, legalLinks } from "@/lib/content";

/**
 * Dark full-height sheet that slides over the page (and the fixed nav):
 * clinical brief sign-up, link columns, legal bar and an edge-to-edge wordmark.
 */
export function SiteFooter() {
  return (
    <footer className="relative z-11 flex min-h-dvh flex-col overflow-hidden rounded-t-sheet bg-ink text-night-fg">
      <Container
        inset="wide"
        className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,21.25rem),1fr))] gap-12 pt-footer-top"
      >
        <div className="flex max-w-115 flex-col gap-5">
          <Text as="h2" variant="kicker" className="text-accent-hi">
            The clinical brief
          </Text>
          <Text variant="subheading" className="text-pretty">
            New guidelines and trials in your specialty, every Monday.
          </Text>
          <NewsletterForm />
        </div>

        <nav aria-label="Footer" className="grid grid-cols-3 gap-6">
          {footerColumns.map((column) => (
            <div key={column.title} className="flex flex-col gap-4">
              <Text as="h2" variant="overline-sm" className="text-muted">
                {column.title}
              </Text>
              <ul className="flex flex-col gap-4">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} variant="link" tone="night">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </Container>

      <div aria-hidden="true" className="shrink-0 grow basis-14" />

      <div className="mx-gutter-wide flex flex-wrap justify-between gap-3 border-t border-night-line py-5 text-muted">
        <Text variant="mono-sm">© 2026 {brandName} · Decision support, not a diagnosis.</Text>
        <ul className="flex gap-5">
          {legalLinks.map((link) => (
            <li key={link.label}>
              <Link href={link.href} variant="mono-sm" tone="night-muted">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <Container inset="wide" aria-hidden="true" className="@container pt-wordmark-top">
        <Text as="div" variant="wordmark" className="flex items-end justify-center gap-[0.16em]">
          <LogoMark className="block size-[0.72em] shrink-0" />
          <span className="whitespace-nowrap pr-[0.06em]">{brandName}</span>
        </Text>
      </Container>
    </footer>
  );
}
