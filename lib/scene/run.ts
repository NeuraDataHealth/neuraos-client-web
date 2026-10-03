import {
  ACESFilmicToneMapping,
  Color,
  HemisphereLight,
  PerspectiveCamera,
  PointLight,
  Raycaster,
  Scene,
  SRGBColorSpace,
  Vector2,
  WebGLRenderer,
} from "three";
import { sectionIds } from "@/lib/content";
import { activeIndexAt, sectionProgress } from "@/lib/coreProgress";
import { approach, poseHexes, poseLinks } from "@/lib/scene/animate";
import { CAMERA, DUST, ENVIRONMENT, HEX_CENTERS, MOTION, STAGES } from "@/lib/scene/config";
import { placeStage, smoothstep, stageAt } from "@/lib/scene/layout";
import { buildDust, buildEnvironment, buildLogo } from "@/lib/scene/model";

const lerp = (from: number, to: number, t: number) => from + (to - from) * t;

const cssColor = (token: string) =>
  new Color(getComputedStyle(document.documentElement).getPropertyValue(token).trim());

/**
 * Mounts the 3D logo into `host` and animates it with the page scroll until
 * the returned cleanup runs. Sections opt in with `data-scene-stage` and mark
 * the content to avoid with `data-scene-anchor`. Without WebGL (or stages)
 * nothing is mounted: the logo is decorative.
 */
export function startLogoScene(host: HTMLElement, options: { reducedMotion: boolean }) {
  const sections = Array.from(
    document.querySelectorAll<HTMLElement>("[data-scene-stage]"),
  ).slice(0, STAGES.length);
  if (sections.length === 0) return () => {};

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
  Object.assign(canvas.style, { display: "block", opacity: "0", transition: "opacity 1s ease" });
  host.appendChild(canvas);

  const accent = cssColor("--color-accent");
  const scene = new Scene();
  const camera = new PerspectiveCamera(CAMERA.fov, 1, 0.1, 100);
  camera.position.set(0, 0, CAMERA.z);
  const environment = buildEnvironment(renderer);
  scene.environment = environment.texture;
  scene.add(new HemisphereLight(ENVIRONMENT.sky, ENVIRONMENT.ground, 0.6));
  const logo = buildLogo(accent);
  scene.add(logo.root);
  const dustCount = window.innerWidth < 640 ? DUST.count / 2 : DUST.count;
  const dust = buildDust(accent, cssColor("--color-ink-soft"), dustCount);
  scene.add(dust.points);
  const keyLight = new PointLight(accent, 0, 8);
  keyLight.position.set(0, 0, 2.5);
  scene.add(keyLight);

  const motion = options.reducedMotion ? 0 : MOTION;
  const anchors = sections.map((section) => section.querySelector<HTMLElement>("[data-scene-anchor]"));
  const coresSection = document.getElementById(sectionIds.cores);
  const footer = document.querySelector<HTMLElement>("[data-site-footer]");
  const hexMeshes = logo.hexes.map((hex) => hex.mesh);

  // Starts small at the centre and glides into the hero pose.
  const pose = { x: 0, y: 0, scale: 0.8, spread: 1, stack: 0, rotateX: 0, rotateY: 0 };
  const pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };
  const pointerNdc = new Vector2(-9, -9);
  const raycaster = new Raycaster();
  let hovered = -1;

  const onPointerMove = (event: PointerEvent) => {
    pointer.targetX = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.targetY = (event.clientY / window.innerHeight) * 2 - 1;
    pointerNdc.set(pointer.targetX, -pointer.targetY);
  };
  const resize = () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  };

  let frame = 0;
  let last = performance.now();
  let rendered = 0;
  const tick = (now: number) => {
    frame = requestAnimationFrame(tick);
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    // Fully covered by the footer: nothing to draw.
    if (footer && footer.getBoundingClientRect().top <= 0) return;

    const time = now / 1000;
    const vh = window.innerHeight;
    const vw = window.innerWidth;
    const scrollY = window.scrollY;
    const tops = sections.map((section) => section.getBoundingClientRect().top + scrollY);
    const stage = stageAt(tops, scrollY, vh);
    const i0 = Math.floor(stage);
    const i1 = Math.min(i0 + 1, sections.length - 1);
    const blend = stage - i0;
    const a = placeStage(STAGES[i0], sections[i0], anchors[i0], vh, vw);
    const b = placeStage(STAGES[i1], sections[i1], anchors[i1], vh, vw);
    const target: typeof pose = {
      x: lerp(a.x, b.x, blend),
      y: lerp(a.y, b.y, blend),
      scale: lerp(a.scale, b.scale, blend),
      spread: lerp(STAGES[i0].spread, STAGES[i1].spread, blend),
      stack: lerp(STAGES[i0].stack, STAGES[i1].stack, blend),
      rotateX: lerp(STAGES[i0].rotateX, STAGES[i1].rotateX, blend),
      rotateY: lerp(STAGES[i0].rotateY, STAGES[i1].rotateY, blend),
    };
    const follow = approach(0.065, dt);
    for (const prop of Object.keys(pose) as Array<keyof typeof pose>) {
      pose[prop] += (target[prop] - pose[prop]) * follow;
    }

    const glide = approach(0.05, dt);
    pointer.x += (pointer.targetX - pointer.x) * glide;
    pointer.y += (pointer.targetY - pointer.y) * glide;
    logo.root.position.set(pose.x, pose.y + Math.sin(time * 0.8) * 0.04 * motion, 0);
    logo.root.scale.setScalar(pose.scale);
    logo.root.rotation.set(
      pose.rotateX + pointer.y * 0.18 * motion,
      pose.rotateY + pointer.x * 0.25 * motion + Math.sin(time * 0.3) * 0.06 * motion,
      0,
    );

    raycaster.setFromCamera(pointerNdc, camera);
    const hit = raycaster.intersectObjects(hexMeshes, false)[0];
    const nextHovered = hit ? Number(hit.object.userData.index) : -1;
    if (nextHovered !== hovered) {
      hovered = nextHovered;
      document.body.style.cursor = hovered >= 0 ? "pointer" : "";
    }

    const activeCore = coresSection
      ? (activeIndexAt(sectionProgress(coresSection, vh), HEX_CENTERS.length) ?? -1)
      : -1;
    poseHexes(logo.hexes, {
      time,
      dt,
      motion,
      hovered,
      activeCore,
      inCores: Math.max(0, 1 - Math.abs(stage - 1) * 2),
      spread: pose.spread,
      stack: pose.stack,
    });
    poseLinks(logo.links, logo.hexes, pose.stack);
    keyLight.intensity = 1 + smoothstep(3.3, 4, stage) * 4;
    dust.points.rotation.set(scrollY * 0.0001, time * 0.02 * motion + scrollY * 0.0002, 0);

    renderer.render(scene, camera);
    // Fade in once a frame has painted at opacity 0.
    if (++rendered === 2) canvas.style.opacity = "1";
  };

  resize();
  window.addEventListener("resize", resize);
  window.addEventListener("pointermove", onPointerMove, { passive: true });
  frame = requestAnimationFrame(tick);

  return () => {
    cancelAnimationFrame(frame);
    window.removeEventListener("resize", resize);
    window.removeEventListener("pointermove", onPointerMove);
    document.body.style.cursor = "";
    logo.dispose();
    dust.dispose();
    environment.dispose();
    renderer.dispose();
    renderer.forceContextLoss();
    canvas.remove();
  };
}
