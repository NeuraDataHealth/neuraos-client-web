import { Text } from "@/components/ui/Text";

type CertificatePreviewProps = { council: string; name: string; registration: string; year: number };

/** Mock registration certificate (fictional data), as drawn in the design. 200×270, zoomed by its container. */
export function CertificatePreview({ council, name, registration, year }: CertificatePreviewProps) {
  return (
    <div className="flex h-67.5 w-50 flex-col items-center gap-1.5 bg-paper px-4 pt-4 pb-3.5 text-center text-ink shadow-card-raised">
      <span aria-hidden="true" className="size-6.5 rounded-full border-[1.5px] border-faint" />
      <Text as="span" variant="doc-kicker" className="text-copy">
        {council}
      </Text>
      <Text as="span" variant="doc-title" className="mt-0.5">
        Certificate of Registration
      </Text>
      <span aria-hidden="true" className="my-1 h-px w-[70%] bg-ink/12" />
      <Text as="span" variant="doc-body" className="text-muted">
        This is to certify that
      </Text>
      <Text as="span" variant="doc-name">
        {name}
      </Text>
      <Text as="span" variant="doc-body" className="max-w-37.5 text-muted">
        is registered as a medical practitioner with this council.
      </Text>
      <span className="mt-auto flex w-full items-end justify-between text-copy">
        <Text as="span" variant="doc-meta" className="text-left">
          Reg. no.
          <br />
          {registration}
        </Text>
        <span aria-hidden="true" className="size-7.5 rounded-full border-[1.5px] border-dashed border-accent/50" />
        <Text as="span" variant="doc-meta" className="text-right">
          Year
          <br />
          {year}
        </Text>
      </span>
    </div>
  );
}
