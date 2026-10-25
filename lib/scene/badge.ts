import {
  ACESFilmicToneMapping,
  Box3,
  Clock,
  Color,
  HemisphereLight,
  PerspectiveCamera,
  Scene,
  SRGBColorSpace,
  Vector3,
  WebGLRenderer,
} from "three";
import { poseLinks } from "@/lib/scene/animate";
import { CAMERA, CENTER, ENVIRONMENT, GLOSS } from "@/lib/scene/config";
import { buildEnvironment, buildLogo } from "@/lib/scene/model";

const cssColor = (token: string) =>
  new Color(getComputedStyle(document.documentElement).getPropertyValue(token).trim());

/**
 * The assembled logo in glossy black for app screens (home, join): a gentle
 * sway and float, with light running around the outer plates, as in the app
 * designs. Fills `fill` of the host's height. Reduced motion renders one still
 * frame. Without WebGL nothing mounts (decorative).
 */
export function startBadgeLogo(host: HTMLElement, options: { reducedMotion: boolean; fill: number }) {
  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({ antialias: true, alpha: true });
  } catch {
    return () => {};
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.outputColorSpace = SRGBColorSpace;
  const canvas = renderer.domElement;
  Object.assign(canvas.style, { display: "block", opacity: "0", transition: "opacity 0.6s ease" });
  host.appendChild(canvas);

  const scene = new Scene();
  const camera = new PerspectiveCamera(CAMERA.fov, 1, 0.1, 100);
  camera.position.set(0, 0, CAMERA.z);
  const environment = buildEnvironment(renderer);
  scene.environment = environment.texture;
  scene.add(new HemisphereLight(ENVIRONMENT.sky, ENVIRONMENT.ground, 0.6));

  const logo = buildLogo(cssColor("--color-accent"), GLOSS);
  for (const hex of logo.hexes) hex.mesh.position.copy(hex.base);
  poseLinks(logo.links, logo.hexes, 0);
  scene.add(logo.root);

  const size = new Box3().setFromObject(logo.root).getSize(new Vector3());
  const viewHeight = 2 * CAMERA.z * Math.tan(((CAMERA.fov / 2) * Math.PI) / 180);
  const outer = logo.hexes.filter((hex) => hex.index !== CENTER);
  const centre = logo.hexes[CENTER];

  const render = (t: number) => {
    logo.root.rotation.set(Math.sin(t * 0.45) * 0.14, Math.sin(t * 0.32) * 0.42, 0);
    logo.root.position.y = Math.sin(t * 0.8) * 0.05;
    const lead = (t * 1.2) % outer.length;
    outer.forEach((hex, i) => {
      const distance = Math.min(Math.abs(i - lead), outer.length - Math.abs(i - lead));
      hex.plate.emissiveIntensity = 0.1 + 1.5 * Math.max(0, 1 - distance) ** 2;
    });
    centre.plate.emissiveIntensity = 0.5 + Math.sin(t * 1.6) * 0.2;
    renderer.render(scene, camera);
  };

  const phase = Math.random() * 6;
  const resize = () => {
    const width = host.clientWidth;
    const height = host.clientHeight;
    if (!width || !height) return;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    logo.root.scale.setScalar((viewHeight * options.fill) / Math.max(size.y, size.x / camera.aspect));
    if (options.reducedMotion) render(phase);
  };
  const observer = new ResizeObserver(resize);
  observer.observe(host);
  resize();
  canvas.style.opacity = "1";

  let frame = 0;
  const clock = new Clock();
  const tick = () => {
    frame = requestAnimationFrame(tick);
    render(clock.getElapsedTime() + phase);
  };
  if (!options.reducedMotion) tick();

  return () => {
    cancelAnimationFrame(frame);
    observer.disconnect();
    logo.dispose();
    environment.dispose();
    renderer.dispose();
    canvas.remove();
  };
}
