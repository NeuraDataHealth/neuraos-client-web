import {
  BackSide,
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  CylinderGeometry,
  DoubleSide,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  PlaneGeometry,
  PMREMGenerator,
  Points,
  PointsMaterial,
  Scene,
  Vector3,
  type Color,
  type ExtrudeGeometry,
  type WebGLRenderer,
} from "three";
import { CHROME, DUST, ENVIRONMENT, HEX_CENTERS, LINKS, PLATE } from "@/lib/scene/config";
import { extrudeCentred, roundedHexShape } from "@/lib/scene/geometry";

export type HexNode = {
  index: number;
  mesh: Mesh<ExtrudeGeometry, MeshPhysicalMaterial>;
  plate: MeshPhysicalMaterial;
  /** Position in the assembled logo. */
  base: Vector3;
  /** Smoothed 0–1 hover/active amounts. */
  lift: number;
  glow: number;
};

export type LinkNode = {
  mesh: Mesh<CylinderGeometry, MeshPhysicalMaterial>;
  from: number;
  to: number;
};

/** Seven chrome hexes (six outer + centre) with glowing face plates, joined by rods. */
export function buildLogo(accent: Color) {
  const materials: MeshPhysicalMaterial[] = [];
  const material = (params: typeof CHROME | typeof PLATE, emissiveIntensity: number) => {
    const created = new MeshPhysicalMaterial({ ...params, emissive: accent, emissiveIntensity });
    materials.push(created);
    return created;
  };

  const hexGeometry = extrudeCentred(roundedHexShape(0.4, 0.22), {
    depth: 0.2,
    bevelEnabled: true,
    bevelThickness: 0.06,
    bevelSize: 0.045,
    bevelSegments: 8,
    curveSegments: 14,
  });
  const plateGeometry = extrudeCentred(roundedHexShape(0.3, 0.22), {
    depth: 0.012,
    bevelEnabled: true,
    bevelThickness: 0.014,
    bevelSize: 0.012,
    bevelSegments: 4,
    curveSegments: 14,
  });
  const linkGeometry = new CylinderGeometry(1, 1, 1, 16, 1, false);

  const root = new Group();
  const centres = [...HEX_CENTERS, [0, 0] as const];
  const hexes = centres.map(([x, y], index): HexNode => {
    const mesh = new Mesh(hexGeometry, material(CHROME, 0));
    const plate = material(PLATE, 0.08);
    const plateMesh = new Mesh(plateGeometry, plate);
    plateMesh.position.z = 0.156; // just proud of the hex's front face
    mesh.add(plateMesh);
    mesh.userData.index = index;
    root.add(mesh);
    return { index, mesh, plate, base: new Vector3(x, y, 0), lift: 0, glow: 0 };
  });

  const links = LINKS.map(([from, to]): LinkNode => {
    const mesh = new Mesh(linkGeometry, material(CHROME, 0));
    root.add(mesh);
    return { mesh, from, to };
  });

  const dispose = () => {
    hexGeometry.dispose();
    plateGeometry.dispose();
    linkGeometry.dispose();
    materials.forEach((created) => created.dispose());
  };

  return { root, hexes, links, dispose };
}

/** A loose cloud of round particles around the logo; a share take the accent. */
export function buildDust(accent: Color, base: Color, count: number) {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const radius = 2.5 + Math.pow(Math.random(), 0.7) * 9;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions.set(
      [
        radius * Math.sin(phi) * Math.cos(theta) * 1.6,
        radius * Math.sin(phi) * Math.sin(theta),
        radius * Math.cos(phi) * 0.8 - 3,
      ],
      i * 3,
    );
    const tint = Math.random() < DUST.accentShare ? accent : base;
    colors.set([tint.r, tint.g, tint.b], i * 3);
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(positions, 3));
  geometry.setAttribute("color", new BufferAttribute(colors, 3));

  const sprite = document.createElement("canvas");
  sprite.width = sprite.height = 64;
  const context = sprite.getContext("2d");
  if (context) {
    context.fillStyle = "#fff";
    context.beginPath();
    context.arc(32, 32, 28, 0, Math.PI * 2);
    context.fill();
  }
  const texture = new CanvasTexture(sprite);
  const material = new PointsMaterial({
    size: DUST.size,
    map: texture,
    vertexColors: true,
    transparent: true,
    opacity: DUST.opacity,
    depthWrite: false,
    alphaTest: 0.01,
  });

  const dispose = () => {
    geometry.dispose();
    material.dispose();
    texture.dispose();
  };
  return { points: new Points(geometry, material), dispose };
}

/** Pre-filtered reflection map of a small studio, for the chrome to reflect. */
export function buildEnvironment(renderer: WebGLRenderer) {
  const room = new Scene();
  const boxGeometry = new BoxGeometry(20, 20, 20);
  const boxMaterial = new MeshBasicMaterial({ color: ENVIRONMENT.room, side: BackSide });
  room.add(new Mesh(boxGeometry, boxMaterial));

  const disposables: Array<{ dispose(): void }> = [boxGeometry, boxMaterial];
  for (const panel of ENVIRONMENT.panels) {
    const geometry = new PlaneGeometry(...panel.size);
    const panelMaterial = new MeshBasicMaterial({ color: panel.color, side: DoubleSide });
    const mesh = new Mesh(geometry, panelMaterial);
    const [x, y, z] = panel.position;
    mesh.position.set(x, y, z);
    mesh.lookAt(0, 0, 0);
    room.add(mesh);
    disposables.push(geometry, panelMaterial);
  }

  const generator = new PMREMGenerator(renderer);
  const target = generator.fromScene(room, 0.03);
  generator.dispose();
  disposables.forEach((item) => item.dispose());
  return target;
}
