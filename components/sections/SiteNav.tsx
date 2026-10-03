import { ButtonLink } from "@/components/ui/ButtonLink";
import { Container } from "@/components/ui/Container";
import { Link } from "@/components/ui/Link";
import { LogoMark } from "@/components/ui/LogoMark";
import { Text } from "@/components/ui/Text";
import { brandName, getAppLink, navLinks, sectionIds } from "@/lib/content";

/** Fixed top bar: brand, section anchors (from `sm` up) and the app CTA. */
export function SiteNav() {
  return (
    <Container
      as="header"
      className="fixed inset-x-0 top-0 z-10 flex h-nav items-center justify-between bg-linear-to-b from-paper to-paper/0"
    >
      <Text
        as="a"
        href={`#${sectionIds.top}`}
        variant="brand"
        className="flex items-center gap-2.5 transition-colors duration-(--duration-hover) hover:text-accent"
      >
        <LogoMark className="size-7 text-ink" />
        {brandName}
      </Text>

      <nav aria-label="Main" className="flex items-center gap-7">
        <ul className="hidden items-center gap-7 sm:flex">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link href={link.href}>{link.label}</Link>
            </li>
          ))}
        </ul>
        <ButtonLink href={getAppLink.href} look="dark-sm">
          {getAppLink.label}
        </ButtonLink>
      </nav>
    </Container>
  );
}
