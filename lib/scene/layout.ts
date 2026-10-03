import { CAMERA, type Stage } from "@/lib/scene/config";

export type Placement = { x: number; y: number; scale: number };
type Box = { left: number; right: number; top: number; bottom: number };

/** World units spanned by the viewport height at z = 0. */
const VIEW_HEIGHT_UNITS = 2 * CAMERA.z * Math.tan(((CAMERA.fov / 2) * Math.PI) / 180);

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

export function smoothstep(edge0: number, edge1: number, x: number) {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

/** Centres the logo (w × h world units) in a screen box, scaled to fit. */
function fitBox(box: Box, width: number, height: number, maxScale: number, vh: number, vw: number) {
  const unitsPerPixel = VIEW_HEIGHT_UNITS / vh;
  const boxWidth = Math.max(0, box.right - box.left) * unitsPerPixel;
  const boxHeight = Math.max(0, box.bottom - box.top) * unitsPerPixel;
  return {
    x: ((box.left + box.right) / 2 - vw / 2) * unitsPerPixel,
    y: (vh / 2 - (box.top + box.bottom) / 2) * unitsPerPixel,
    scale: Math.max(0.14, Math.min(maxScale, boxWidth / width, boxHeight / height)),
  };
}

/** Right edge of the content when it sits in a single row (design heuristic). */
function contentRight(anchor: HTMLElement, anchorTop: number) {
  const children = Array.from(anchor.children);
  const widest = Math.max(
    ...children.map((child) => {
      const rect = child.getBoundingClientRect();
      return rect.left + Math.min(rect.width, child.scrollWidth || rect.width);
    }),
  );
  const heading = anchor.querySelector("h1, h2");
  const headingRight = heading ? heading.getBoundingClientRect().right : widest;
  const second = children[1];
  return second && second.getBoundingClientRect().top > anchorTop + 20
    ? Math.max(headingRight, second.getBoundingClientRect().right)
    : widest;
}

/**
 * Where the logo sits for one section: in the free space above its content
 * (or beside it when that space is too short), or beside the content, or as a
 * small badge top-right when the screen is too narrow for either.
 */
export function placeStage(
  stage: Stage,
  section: HTMLElement | undefined,
  anchor: HTMLElement | null | undefined,
  vh: number,
  vw: number,
): Placement {
  const width = stage.stack ? 1.9 : 2.8 + (stage.spread - 1) * 2.3;
  const height = stage.stack ? 2.9 : 3.25 + (stage.spread - 1) * 2.6;
  if (!section || !anchor) return { x: 0, y: 0, scale: 0.6 };

  const rect = anchor.getBoundingClientRect();
  let box: Box;
  if (stage.placement === "above") {
    // Measured as if the section's top were at the top of the viewport.
    const contentTop = rect.top - section.getBoundingClientRect().top;
    box = { left: 24, right: vw - 24, top: 84, bottom: contentTop - 28 };
    if (box.bottom - box.top < 200) {
      const right = contentRight(anchor, rect.top);
      if (vw - right > 220) box = { left: right + 24, right: vw - 24, top: 84, bottom: vh - 90 };
    }
  } else {
    const spaceLeft = rect.left;
    const spaceRight = vw - rect.right;
    if (Math.max(spaceLeft, spaceRight) >= 240) {
      box =
        spaceLeft > spaceRight
          ? { left: 24, right: rect.left - 36, top: 90, bottom: vh - 40 }
          : { left: rect.right + 36, right: vw - 24, top: 90, bottom: vh - 40 };
    } else {
      box = { left: vw - 130, right: vw - 16, top: 78, bottom: 200 };
    }
  }
  return fitBox(box, width, height, stage.maxScale, vh, vw);
}

/**
 * Fractional stage index for a scroll position: each section holds its pose,
 * then eases into the next one over the last ~1.1 viewports before it.
 */
export function stageAt(sectionTops: readonly number[], scrollY: number, vh: number) {
  let stage = 0;
  for (let i = 0; i < sectionTops.length - 1; i++) {
    if (scrollY < sectionTops[i]) continue;
    const span = Math.max(1, sectionTops[i + 1] - sectionTops[i]);
    const blendLength = Math.min(1, (vh * 1.1) / span);
    stage = i + smoothstep(1 - blendLength, 1, (scrollY - sectionTops[i]) / span);
  }
  return Math.min(stage, sectionTops.length - 1);
}
