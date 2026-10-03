/**
 * 3D logo constants, ported from the design (NeuraOS Site.dc.html).
 * Hex colors here are material / lighting values, not UI colors; the accent
 * and dust tint are read from the CSS tokens at runtime.
 */

/** Centres of the six outer hexes (logo-contours.json), clockwise from the top. */
export const HEX_CENTERS: ReadonlyArray<readonly [number, number]> = [
  [0, 1.1962],
  [1, 0.6269],
  [1, -0.5269],
  [0, -1.1962],
  [-1, -0.5269],
  [-1, 0.6269],
];

/** Index of the centre hex, after the six outer ones. */
export const CENTER = HEX_CENTERS.length;

/** Spokes from the centre to every hex, then the outer ring. */
export const LINKS: ReadonlyArray<readonly [number, number]> = [
  ...HEX_CENTERS.map((_, i) => [CENTER, i] as const),
  ...HEX_CENTERS.map((_, i) => [i, (i + 1) % HEX_CENTERS.length] as const),
];

export type Stage = {
  /** 1 = assembled logo; >1 pushes the hexes apart. */
  spread: number;
  /** 0 = logo; 1 = hexes stacked into a tilted column. */
  stack: number;
  rotateX: number;
  rotateY: number;
  maxScale: number;
  /** Fit into the free space above the section content, or beside it. */
  placement: "above" | "side";
};

/** One pose per section, in page order (hero, cores, privacy, app, get). */
export const STAGES: readonly Stage[] = [
  { spread: 1, stack: 0, rotateX: 0, rotateY: 0, maxScale: 0.9, placement: "above" },
  { spread: 1.7, stack: 0, rotateX: 0.2, rotateY: -0.5, maxScale: 1, placement: "side" },
  { spread: 1, stack: 1, rotateX: 0.4, rotateY: 0.7, maxScale: 1.05, placement: "side" },
  { spread: 1, stack: 0, rotateX: 0, rotateY: 0.35, maxScale: 0.9, placement: "side" },
  { spread: 1, stack: 0, rotateX: 0, rotateY: Math.PI * 2, maxScale: 0.8, placement: "above" },
];

export const CAMERA = { fov: 35, z: 7.2 } as const;

/** Design "motion" setting (0–2): float, drift and pointer parallax strength. */
export const MOTION = 2;

/** Design "Chrome" logo finish. */
export const CHROME = {
  color: 0x8c929c,
  metalness: 1,
  roughness: 0.14,
  clearcoat: 0.4,
  clearcoatRoughness: 0.12,
} as const;

/** Glossy black face plate set into each hex. */
export const PLATE = {
  color: 0x07080b,
  metalness: 0.2,
  roughness: 0.12,
  clearcoat: 1,
  clearcoatRoughness: 0.05,
} as const;

/** Studio the chrome reflects: a dark room with four light panels. */
export const ENVIRONMENT = {
  room: 0x1a1c20,
  panels: [
    { size: [9, 1.4], position: [0, 7, 3], color: 0xffffff },
    { size: [1.4, 9], position: [-8, 0, 3], color: 0xdfe6f2 },
    { size: [1.4, 8], position: [8, 1, -2], color: 0xffffff },
    { size: [7, 0.8], position: [0, -6, 6], color: 0x8a93a3 },
  ],
  sky: 0xffffff,
  ground: 0xdfe4ec,
} as const;

export const DUST = { count: 2800, accentShare: 0.22, size: 0.045, opacity: 0.7 } as const;
