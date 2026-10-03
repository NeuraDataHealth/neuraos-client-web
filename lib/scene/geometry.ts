import { ExtrudeGeometry, Shape, type ExtrudeGeometryOptions } from "three";

/**
 * Pointy-top hexagon of circumradius `radius`, each corner rounded off by
 * `rounding` (fraction of the edge length) with a quadratic curve.
 */
export function roundedHexShape(radius: number, rounding: number) {
  const corners = Array.from({ length: 6 }, (_, k) => {
    const angle = Math.PI / 2 + (k * Math.PI) / 3;
    return [Math.cos(angle) * radius, Math.sin(angle) * radius] as const;
  });

  const shape = new Shape();
  corners.forEach(([x, y], k) => {
    const [px, py] = corners[(k + 5) % 6];
    const [nx, ny] = corners[(k + 1) % 6];
    const startX = x + (px - x) * rounding;
    const startY = y + (py - y) * rounding;
    if (k === 0) shape.moveTo(startX, startY);
    else shape.lineTo(startX, startY);
    shape.quadraticCurveTo(x, y, x + (nx - x) * rounding, y + (ny - y) * rounding);
  });
  shape.closePath();
  return shape;
}

/** Extrudes `shape` and centres the result on z = 0. */
export function extrudeCentred(shape: Shape, options: ExtrudeGeometryOptions) {
  const geometry = new ExtrudeGeometry(shape, options);
  geometry.computeBoundingBox();
  const box = geometry.boundingBox;
  if (box) geometry.translate(0, 0, -(box.min.z + box.max.z) / 2);
  return geometry;
}
