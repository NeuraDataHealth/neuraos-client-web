import { Reveal } from "@/components/motion/Reveal";
import { Section } from "@/components/ui/Section";
import { Text } from "@/components/ui/Text";
import { privacyFacts, sectionIds } from "@/lib/content";

/** "Patient data stays yours": copy on the right, guarantees as a definition list. */
export function Privacy() {
  return (
    <Section
      id={sectionIds.privacy}
      labelledBy="privacy-title"
      data-scene-stage
      className="flex min-h-[130vh] items-center justify-end"
    >
      <Reveal data-scene-anchor className="flex max-w-112.5 flex-col gap-6.5">
        <Text as="h2" id="privacy-title" variant="heading">
          Patient data
          <br />
          stays yours.
        </Text>
        <Text variant="lead" className="text-pretty text-copy">
          Cases are de-identified on your device before anything is analysed. Nothing you share
          trains our models, and a deleted case is gone for good.
        </Text>
        <dl className="flex flex-col border-t border-line">
          {privacyFacts.map((fact) => (
            <div
              key={fact.label}
              className="flex justify-between gap-4 border-b border-line py-3.5"
            >
              <Text as="dt" variant="body" className="text-label">
                {fact.label}
              </Text>
              <Text as="dd" variant="mono" className="text-right">
                {fact.value}
              </Text>
            </div>
          ))}
        </dl>
      </Reveal>
    </Section>
  );
}
