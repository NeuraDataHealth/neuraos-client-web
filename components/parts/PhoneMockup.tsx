import { clsx } from "clsx";
import Image from "next/image";
import { Text } from "@/components/ui/Text";

const differential = [
  { diagnosis: "NSTEMI", likelihood: "Most likely", strong: true },
  { diagnosis: "Unstable angina", likelihood: "Less likely", strong: false },
  { diagnosis: "Aortic dissection", likelihood: "Rule out", strong: false },
] as const;

/**
 * The NeuraOS app on a phone (fixed 300×640 screen): a chest-pain case and its
 * second opinion. Exposed to assistive tech as one labelled image.
 */
export function PhoneMockup() {
  return (
    <div
      role="img"
      aria-label="NeuraOS app: a second opinion on a chest pain case ranks NSTEMI most likely and cites the ESC guideline."
      className="rounded-device bg-device-frame p-2.25 shadow-device"
    >
      <div className="flex h-160 w-75 flex-col overflow-hidden rounded-screen bg-ink text-device-fg">
        <div className="flex h-11.5 items-center justify-between px-6.5">
          <Text as="span" variant="device-status">
            9:41
          </Text>
          <span className="h-2.25 w-5 rounded-xs border-[1.2px] border-device-fg/50" />
        </div>

        <div className="flex h-11 items-center gap-2.5 border-b border-paper/6 px-4">
          <Image src="/brand/logo-app.png" alt="" width={18} height={18} className="size-4.5" />
          <Text as="span" variant="device-label">
            Case · 58M chest pain
          </Text>
        </div>

        <div className="flex flex-1 flex-col gap-3 overflow-hidden p-4">
          <Text
            variant="device-body"
            className="max-w-[86%] self-end rounded-bubble rounded-br-sm bg-device-bubble px-3.25 py-2.5"
          >
            58M, 2h substernal pain, diaphoretic. hs-TnT 38 → 61 ng/L. ECG: 1mm ST depression
            V4–V6.
          </Text>

          <Text
            as="span"
            variant="device-meta"
            className="flex h-5.5 items-center self-start rounded-full border border-accent/35 bg-accent/14 px-2.25 text-accent-hi"
          >
            Second opinion · thought 8s
          </Text>

          <div className="flex flex-col gap-2.5 rounded-card border border-paper/7 bg-device-card p-3">
            {differential.map((row) => (
              <div key={row.diagnosis} className="grid grid-cols-[1fr_auto] gap-2">
                <Text as="span" variant="device-small">
                  {row.diagnosis}
                </Text>
                <Text
                  as="span"
                  variant="device-tag"
                  className={clsx(row.strong ? "text-accent-hi" : "text-faint")}
                >
                  {row.likelihood}
                </Text>
              </div>
            ))}
          </div>

          <Text variant="device-copy" className="text-device-copy">
            Rising troponin with ischaemic ECG changes fits NSTEMI. Consider early invasive
            strategy within 24h.
          </Text>
          <Text variant="device-meta" className="text-faint">
            Sources: ESC ACS guideline · 2 trials
          </Text>
        </div>

        <div className="p-2.5 pb-6.5">
          <div className="flex h-11.5 items-center justify-between rounded-full border border-paper/9 bg-device-field pr-1.5 pl-4">
            <Text as="span" variant="device-body" className="text-muted">
              Add to case…
            </Text>
            <span className="size-8.5 rounded-full bg-linear-to-b from-accent-hi to-accent" />
          </div>
        </div>
      </div>
    </div>
  );
}
