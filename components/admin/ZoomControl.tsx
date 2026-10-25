import { clsx } from "clsx";
import { Text } from "@/components/ui/Text";

type ZoomControlProps = {
  zoom: number;
  onZoom: (zoom: number) => void;
  min?: number;
  max?: number;
  /** `dark` in the full-screen viewer. */
  tone?: "light" | "dark";
};

/** − 100 % + pill. */
export function ZoomControl({ zoom, onZoom, min = 0.5, max = 2, tone = "light" }: ZoomControlProps) {
  const step = (d: number) => onZoom(Math.min(max, Math.max(min, Math.round((zoom + d) * 100) / 100)));
  const key = clsx(
    "flex size-7.5 cursor-pointer items-center justify-center rounded-full disabled:cursor-default disabled:opacity-40",
    tone === "light" ? "text-ink hover:bg-paper" : "text-paper hover:bg-paper/10",
  );
  return (
    <span
      className={clsx(
        "flex h-8.5 shrink-0 items-center rounded-full px-0.5",
        tone === "light" ? "bg-field" : "border border-paper/12 bg-paper/8",
      )}
    >
      <Text as="button" type="button" variant="ui-lg" aria-label="Zoom out" disabled={zoom <= min} onClick={() => step(-0.25)} className={key}>
        −
      </Text>
      <Text as="span" variant="mono-meta" className={clsx("w-10 text-center", tone === "light" ? "text-copy" : "text-on-dark")} aria-live="polite">
        {Math.round(zoom * 100)}%
      </Text>
      <Text as="button" type="button" variant="ui-lg" aria-label="Zoom in" disabled={zoom >= max} onClick={() => step(0.25)} className={key}>
        +
      </Text>
    </span>
  );
}
