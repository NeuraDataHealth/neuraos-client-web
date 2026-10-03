import { Vector3 } from "three";
import { CENTER } from "@/lib/scene/config";
import type { HexNode, LinkNode } from "@/lib/scene/model";

export type FrameState = {
  /** Seconds since the page started. */
  time: number;
  /** Seconds since the previous frame. */
  dt: number;
  /** 0 with reduced motion, otherwise the design's motion strength. */
  motion: number;
  /** Hex under the pointer, or -1. */
  hovered: number;
  /** Core lit by the Cores section scroll, or -1. */
  activeCore: number;
  /** 0–1: how fully the Cores pose is showing. */
  inCores: number;
  spread: number;
  stack: number;
};

const lerp = (from: number, to: number, t: number) => from + (to - from) * t;

/**
 * Frame-rate independent smoothing: the factor that gives the design's
 * per-frame `value += (target - value) * rate` at 60fps, for any `dt`.
 */
export const approach = (rate: number, dt: number) => 1 - Math.pow(1 - rate, dt * 60);

/** Slot in the stacked column for each outer hex; the centre hex takes slot 3. */
const columnSlot = (index: number) => (index < 3 ? index : index + 1);

const exploded = new Vector3();
const stacked = new Vector3();
const from = new Vector3();
const to = new Vector3();
const along = new Vector3();
const UP = new Vector3(0, 1, 0);

/** Positions, tilts and glows every hex for this frame. */
export function poseHexes(hexes: readonly HexNode[], frame: FrameState) {
  const { time, dt, motion, spread, stack } = frame;
  for (const hex of hexes) {
    const isCenter = hex.index === CENTER;
    const on =
      hex.index === frame.hovered ||
      (!isCenter && hex.index === frame.activeCore && frame.inCores > 0.3);
    hex.lift += ((on ? 1 : 0) - hex.lift) * approach(0.1, dt);
    hex.glow += ((on ? 1 : 0) - hex.glow) * approach(0.08, dt);
    const tilt = lerp(0, -1.35, stack) + hex.lift * 0.15;

    if (isCenter) {
      hex.mesh.position.set(0, 0, hex.lift * 0.35 * (1 - stack));
      hex.mesh.rotation.set(tilt, Math.sin(time * 0.6) * 0.05 * (spread - 1) * motion, lerp(0, 0.36, stack));
      hex.plate.emissiveIntensity = 0.12 + hex.glow * 1.6 + frame.inCores * 0.5;
    } else {
      const side = hex.index % 2 ? 1 : -1;
      exploded.set(
        hex.base.x * spread,
        hex.base.y * spread,
        side * 0.55 * (spread - 1) + hex.lift * 0.35,
      );
      stacked.set(0, (3 - columnSlot(hex.index)) * 0.27, 0);
      hex.mesh.position.lerpVectors(exploded, stacked, stack);
      hex.mesh.rotation.set(
        tilt,
        side * (spread - 1) * 0.5 + Math.sin(time * 0.6 + hex.index) * 0.05 * (spread - 1) * motion,
        lerp(0, hex.index * 0.12, stack),
      );
      // Stacked into a column, a light runs down the plates.
      const chase = motion && hex.index === 5 - Math.floor((time * 2) % 6) ? stack * 0.48 : 0;
      hex.plate.emissiveIntensity = 0.08 + hex.glow * 1.6 + chase;
    }
    hex.mesh.material.emissiveIntensity = hex.glow * 0.25;
  }
}

/** Stretches each rod between its two hexes; rods retract as the hexes stack. */
export function poseLinks(links: readonly LinkNode[], hexes: readonly HexNode[], stack: number) {
  const radius = 0.06 * (1 - stack);
  for (const link of links) {
    from.copy(hexes[link.from].mesh.position);
    to.copy(hexes[link.to].mesh.position);
    along.subVectors(to, from);
    const length = along.length();
    link.mesh.visible = radius > 0.002 && length > 0.01;
    if (!link.mesh.visible) continue;
    link.mesh.position.addVectors(from, to).multiplyScalar(0.5);
    link.mesh.quaternion.setFromUnitVectors(UP, along.normalize());
    link.mesh.scale.set(radius, length, radius);
    link.mesh.material.emissiveIntensity = Math.max(hexes[link.from].glow, hexes[link.to].glow) * 0.5;
  }
}
