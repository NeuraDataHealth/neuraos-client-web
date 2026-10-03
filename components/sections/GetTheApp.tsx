import { Reveal } from "@/components/motion/Reveal";
import { LaunchSoonButton } from "@/components/parts/LaunchSoonButton";
import { Section } from "@/components/ui/Section";
import { Text } from "@/components/ui/Text";
import { launchCtas, sectionIds } from "@/lib/content";

/** Closing call to action: centred at the bottom of the screen, store keys (launching soon), disclaimer. */
export function GetTheApp() {
  return (
    <Section
      id={sectionIds.get}
      labelledBy="get-title"
      data-scene-stage
      className="flex min-h-svh flex-col items-center justify-end pb-10 text-center"
    >
      <Reveal data-scene-anchor className="flex flex-col items-center gap-6.5">
        <Text as="h2" id="get-title" variant="display-cta">
          Bring it your
          <br />
          hardest case.
        </Text>
        <div className="flex flex-wrap justify-center gap-3.5">
          <LaunchSoonButton look="accent-lg" message={launchCtas.appStore.message}>
            {launchCtas.appStore.label}
          </LaunchSoonButton>
          <LaunchSoonButton look="dark-lg" message={launchCtas.googlePlay.message}>
            {launchCtas.googlePlay.label}
          </LaunchSoonButton>
        </div>
        <Text variant="caption" className="max-w-110 text-muted">
          Clinical decision support. NeuraOS informs your judgment — it doesn&apos;t replace it.
        </Text>
      </Reveal>
    </Section>
  );
}
