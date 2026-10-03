import { Reveal } from "@/components/motion/Reveal";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Section } from "@/components/ui/Section";
import { Text } from "@/components/ui/Text";
import { sectionIds, storeLinks } from "@/lib/content";

/** Closing call to action: centred at the bottom of the screen, store keys, disclaimer. */
export function GetTheApp() {
  return (
    <Section
      id={sectionIds.get}
      labelledBy="get-title"
      className="flex min-h-svh flex-col items-center justify-end pb-10 text-center"
    >
      <Reveal className="flex flex-col items-center gap-6.5">
        <Text as="h2" id="get-title" variant="display-cta">
          Bring it your
          <br />
          hardest case.
        </Text>
        <div className="flex flex-wrap justify-center gap-3.5">
          <ButtonLink href={storeLinks.appStore.href} look="accent-lg">
            {storeLinks.appStore.label}
          </ButtonLink>
          <ButtonLink href={storeLinks.googlePlay.href} look="dark-lg">
            {storeLinks.googlePlay.label}
          </ButtonLink>
        </div>
        <Text variant="caption" className="max-w-110 text-muted">
          Clinical decision support. NeuraOS informs your judgment — it doesn&apos;t replace it.
        </Text>
      </Reveal>
    </Section>
  );
}
