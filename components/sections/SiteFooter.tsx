import { ButtonLink } from "@/components/ui/ButtonLink";
import { Container } from "@/components/ui/Container";
import { Link } from "@/components/ui/Link";
import { LogoMark } from "@/components/ui/LogoMark";
import { Text } from "@/components/ui/Text";
import { brandName, footerColumns, footerQuote, legalLinks, socialLinks } from "@/lib/content";

/**
 * Dark full-height sheet that slides over the page (and the fixed nav):
 * social links, link columns, a quote filling the free height, legal bar and
 * an edge-to-edge wordmark.
 */
export function SiteFooter() {
  return (
    <footer
      data-site-footer
      className="relative z-11 flex min-h-dvh flex-col overflow-hidden rounded-t-sheet bg-ink text-night-fg"
    >
      <Container
        inset="wide"
        className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,21.25rem),1fr))] gap-12 pt-footer-top"
      >
        <div className="flex max-w-115 flex-col gap-5">
          <Text as="h2" variant="kicker" className="text-accent-hi">
            Follow the build
          </Text>
          <Text variant="subheading" className="text-pretty">
            Updates from the team as we get ready to launch.
          </Text>
          <ul className="flex flex-wrap gap-2.5">
            {socialLinks.map((social) => (
              <li key={social.label}>
                <ButtonLink
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  look="night-sm"
                >
                  {social.label}
                  <Text as="span" variant="mono-sm" aria-hidden="true" className="text-faint">
                    ↗
                  </Text>
                  <Text as="span" variant="button-sm" className="sr-only">
                    (opens in a new tab)
                  </Text>
                </ButtonLink>
              </li>
            ))}
          </ul>
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

      <Container inset="wide" className="flex min-h-0 flex-auto items-center py-quote-y">
        <figure className="flex w-full flex-col items-center gap-quote-gap text-center">
          <Text as="blockquote" variant="quote" className="w-full text-balance">
            “{footerQuote.text}”
          </Text>
          <Text as="figcaption" variant="attribution" className="text-faint">
            — {footerQuote.author}
          </Text>
        </figure>
      </Container>

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
