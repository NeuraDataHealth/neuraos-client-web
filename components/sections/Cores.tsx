import { CoresList } from "@/components/parts/CoresList";
import { Section } from "@/components/ui/Section";
import { Text } from "@/components/ui/Text";
import { sectionIds } from "@/lib/content";

/**
 * "Six cores": a 420vh-tall section whose panel stays pinned for the full
 * scroll while the list steps through each core. The right side is left for
 * the 3D logo.
 */
export function Cores() {
  return (
    <Section id={sectionIds.cores} labelledBy="cores-title" className="h-[420vh]">
      <div className="sticky top-0 flex h-svh items-center">
        <div className="flex max-w-117.5 flex-col gap-7">
          <Text as="h2" id="cores-title" variant="heading">
            Six cores.
            <br />
            One clinical mind.
          </Text>
          <CoresList />
        </div>
      </div>
    </Section>
  );
}
