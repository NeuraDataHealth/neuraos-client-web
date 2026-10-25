"use client";

import { clsx } from "clsx";
import { useEffect, useState } from "react";
import { duration } from "@/components/account/dates";
import { Icon } from "@/components/ui/Icon";
import { Panel } from "@/components/ui/Panel";
import { Text } from "@/components/ui/Text";

const BARS = 64;

/** Deterministic waveform from the id (design's seeded bars, swelling in the middle). */
function waveform(seed: string): number[] {
  let h = 0;
  for (const ch of seed) h = (h * 33 + ch.charCodeAt(0)) >>> 0;
  return Array.from({ length: BARS }, (_, i) => {
    h = (Math.imul(h, 1103515245) + 12345) >>> 0;
    const r = (h >>> 8) / 16777216;
    const envelope = 0.5 + 0.5 * Math.sin(((i + 2) / (BARS + 2)) * Math.PI);
    return Math.round((0.2 + 0.8 * r) * envelope * 100);
  });
}

/**
 * Voice note player (design): play / pause, waveform progress, click to seek.
 * Static: plays a timer only; at integration an <audio> element on a signed URL.
 */
export function VoicePlayer({ id, seconds }: { id: string; seconds: number }) {
  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const bars = waveform(id);

  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(() => {
      setPosition((p) => {
        if (p + 1 >= seconds) {
          setPlaying(false);
          return seconds;
        }
        return p + 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [playing, seconds]);

  return (
    <Panel size="lg" className="flex items-center gap-4 py-4 pr-5 pl-4">
      <button
        type="button"
        onClick={() => {
          if (position >= seconds) setPosition(0);
          setPlaying((p) => !p);
        }}
        aria-label={playing ? "Pause" : "Play"}
        className="flex size-13 shrink-0 cursor-pointer items-center justify-center rounded-full bg-linear-to-b from-accent-hi to-accent text-paper shadow-key-accent-dialog active:translate-y-0.5"
      >
        <Icon name={playing ? "pause" : "play"} size={16} />
      </button>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div
          role="slider"
          tabIndex={0}
          aria-label="Position"
          aria-valuemin={0}
          aria-valuemax={seconds}
          aria-valuenow={position}
          aria-valuetext={duration(position)}
          onClick={(event) => {
            const box = event.currentTarget.getBoundingClientRect();
            setPosition(Math.round(((event.clientX - box.left) / box.width) * seconds));
          }}
          onKeyDown={(event) => {
            if (event.key === "ArrowRight") setPosition((p) => Math.min(seconds, p + 5));
            if (event.key === "ArrowLeft") setPosition((p) => Math.max(0, p - 5));
          }}
          className="flex h-11 cursor-pointer items-center gap-0.5"
        >
          {bars.map((height, i) => (
            <span
              key={i}
              className={clsx("min-w-0 flex-1 rounded-xs", i / BARS < position / (seconds || 1) ? "bg-accent" : "bg-ink/16")}
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
        <Text variant="mono-meta" className="flex justify-between text-muted">
          <span>{duration(position)}</span>
          <span>{duration(seconds)}</span>
        </Text>
      </div>
    </Panel>
  );
}
