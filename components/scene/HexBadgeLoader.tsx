"use client";

import dynamic from "next/dynamic";

const HexBadge = dynamic(() => import("@/components/scene/HexBadge").then((mod) => mod.HexBadge), {
  ssr: false,
});

type HexBadgeLoaderProps = {
  fill?: number;
};

/** Loads three.js as its own chunk, client-only; the space is reserved by the parent. */
export function HexBadgeLoader({ fill }: HexBadgeLoaderProps) {
  return <HexBadge fill={fill} />;
}
