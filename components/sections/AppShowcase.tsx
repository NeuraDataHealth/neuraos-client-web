import { Reveal } from "@/components/motion/Reveal";
import { PhoneMockup } from "@/components/parts/PhoneMockup";
import { Chip } from "@/components/ui/Chip";
import { Section } from "@/components/ui/Section";
import { Text } from "@/components/ui/Text";
import { appSettings, sectionIds } from "@/lib/content";

/** "Thinks like your specialty": copy and setting chips beside the phone. */
export function AppShowcase() {
  return (
    <Section
      id={sectionIds.app}
      labelledBy="app-title"
      data-scene-stage
      className="flex min-h-[130vh] items-center justify-end"
    >
      <div data-scene-anchor className="flex flex-wrap items-center justify-end gap-12">
        <Reveal className="flex max-w-82.5 flex-col gap-6">
          <Text as="h2" id="app-title" variant="heading-compact">
            Thinks like your specialty.
          </Text>
          <Text variant="lead" className="text-pretty text-copy">
            Set your field, how deep you want the reasoning, and which sources come first. Every
            answer shows its work.
          </Text>
          <ul aria-label="Example settings" className="flex flex-wrap gap-2">
            {appSettings.map((setting) => (
              <li key={setting}>
                <Chip>{setting}</Chip>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal kind="device">
          <PhoneMockup />
        </Reveal>
      </div>
    </Section>
  );
}
