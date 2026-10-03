# NeuraOS site — progress

Source design: Claude Design project "NeuraOS AI app mockups" → `NeuraOS Site.dc.html`
(saved in `design/`, reference only).

## Done

### Phase 1 — Foundation (2026-10-03)
- `design/` bundle saved (site HTML, support.js, logos, logo-contours.json); excluded from ESLint, tsconfig and Tailwind scanning (`@source not`).
- `app/globals.css`: all design tokens (colors, weights, spacing/gutters, radii, key-press shadows, easing, durations, backdrop gradient). Tailwind default colors, text sizes, leading, tracking, radii, shadows and easings are reset so only NeuraOS tokens exist. Base: selection, focus-visible ring, reduced-motion.
- `styles/fonts.ts`: Geist + Geist Mono (next/font/google, variable fonts, CSS variables).
- `styles/typography.ts`: full type scale (display, headings, lead, UI, mono, device-*).
- `components/ui/`: Text (polymorphic), Container (gutters), Section (anchored, labelled), Backdrop.
- `app/layout.tsx`: fonts, metadata, viewport theme color, skip link, backdrop. `app/page.tsx`: empty `<main id="main">`.
- `app/icon.svg` from the logo mark (adapts to dark browser UI); starter favicon and public SVGs removed.
- Packages: `clsx`.

### Phase 2 — Nav (2026-10-04)
- `components/ui/LogoMark.tsx`: hex mark as inline SVG (`currentColor`), paths verified identical to `logo7-black.svg`.
- `components/ui/keyStyles.ts` + `ButtonLink.tsx`: pressable key buttons, one `look` per tone/size the design uses (`dark-sm`, `dark-lg`, `accent-md`, `accent-lg`, `accent-field`, `light-md`); edge collapses and the key drops 3–4px on press.
- `components/ui/Link.tsx`: text link with accent hover (`nav` tone; footer tones come with the footer).
- `lib/content.ts`: brand name, nav anchors, "Get the app".
- `components/sections/SiteNav.tsx`: fixed 72px header, white-to-clear gradient, brand (hover accent), `<nav aria-label="Main">` with anchor list + CTA. Rendered in `app/page.tsx`.
- Globals: `--duration-hover`, no tap highlight on links/buttons.

### Phase 3 — Hero (2026-10-04)
- `components/sections/Hero.tsx`: full-height (`100svh`) opening screen, copy anchored to the bottom (space above is for the 3D logo). h1 "A second opinion, always on call.", lead, Download (`accent-md` → #get) and See how it thinks (`light-md` → #cores), mono meta strip.
- Reveal tokens in globals: `animate-reveal` / `animate-reveal-late` (fade with `ease` + 24px rise with the reveal curve, 1s; late = 150ms stagger), keyframes `reveal-fade` / `reveal-rise`.
- `lib/content.ts`: `sectionIds` is the single source for section ids and anchor hrefs (nav uses it too).

### Phase 4 — Cores (2026-10-04)
- `components/sections/Cores.tsx`: 420vh section with a pinned (`sticky`, `100svh`) panel: h2 "Six cores. One clinical mind." + list. Right side left for the 3D logo.
- `components/parts/CoresList.tsx` (client): `<ol>` of the six cores (number, `h3` name, description). Active core gets the accent bar, ink name and its description; others dim to `ghost`. Bar/color fade 400ms; descriptions expand/collapse smoothly (grid rows + opacity) and stay in the DOM for screen readers; active item has `aria-current`.
- `hooks/useActiveCore.ts`: rAF-throttled passive scroll listener; progress through the section split into 6 equal bands, last core kept outside the section (same math as the design).
- `lib/content.ts`: `cores` copy.

### Phase 5 — Privacy (2026-10-04)
- `components/sections/Privacy.tsx`: 130vh section, block on the right (max 450px): h2 "Patient data stays yours.", lead, guarantees as a `<dl>` (label / mono value rows with hairlines).
- `components/motion/Reveal.tsx` (client): IntersectionObserver (15% visible) → applies `animate-reveal` once, then disconnects.
- Globals: `[data-reveal="pending"]` is hidden only under `@media (scripting: enabled)`, so content stays visible without JS.
- `lib/content.ts`: `privacyFacts`.

### Phase 6 — App (2026-10-04)
- `components/sections/AppShowcase.tsx`: 130vh section, copy (h2 "Thinks like your specialty.", lead, setting chips as a `<ul>`) beside the phone, wrapping on narrow screens.
- `components/parts/PhoneMockup.tsx`: 300×640 screen in a 9px frame: status bar, case header (app logo via next/image), case bubble, "Second opinion · thought 8s" badge, differential card, reasoning, sources, composer. One `role="img"` with a descriptive label.
- `components/ui/Chip.tsx`: static pill with the light key finish.
- `Reveal` gains `kind="device"` → `animate-reveal-device` (40px rise, 1.1s, 100ms delay) as in the design.
- Typography: `device-tag` (mono 12.5px, differential likelihoods). Asset: `public/brand/logo-app.png`.

### Phase 7 — Get the app (2026-10-04)
- `components/sections/GetTheApp.tsx`: full-height (`100svh`) closing section, content centred at the bottom: h2 "Bring it your hardest case." (`display-cta`), App Store (`accent-lg`) and Google Play (`dark-lg`) keys, disclaimer caption. Revealed on scroll.
- `lib/content.ts`: `storeLinks` (placeholder `#get` hrefs, as in the design).

### Phase 8 — Footer (2026-10-04)
- `components/sections/SiteFooter.tsx`: full-height (`100dvh`) dark sheet, 36px rounded top, above main and the fixed nav (`z-11`). Clinical brief block, `<nav aria-label="Footer">` with three link columns, legal bar, edge-to-edge wordmark (decorative, `aria-hidden`).
- `components/parts/NewsletterForm.tsx` (client) + `app/actions.ts` (Server Action `subscribe`): labelled email field, Subscribe key, inline status (`aria-live`). Works without JS. **Validates only — nothing is stored until a provider is chosen.**
- `components/ui/Button.tsx`: `<button>` key sharing `keyStyles`. `Link` gains `night` / `night-muted` tones (hover `accent-hi` for contrast on dark).
- Wordmark: `@container` + `19.9cqi` (measured: Geist 600 "NeuraOS" = 4.3em; logo .72em + gap .16em + tracking → 96% fill, capped at 250px), replacing the design's JS fit.
- Typography: `link` (14px, lh 1), `field` (15px input). Spacing: `--spacing-wordmark-top`. `lib/content.ts`: `footerColumns`, `legalLinks`.

### Phase 9 — Global motion (2026-10-04)
- `components/motion/SmoothScroll.tsx` (client, in layout): Lenis 1.3 with the design's settings (lerp .075, wheel ×0.9, touch ×1.4, `autoRaf`) + `lenis/dist/lenis.css`. In-page anchors glide in 1.6s (ease-out quart); `#` scrolls to top. Keyboard-activated anchors move focus to the target on arrival; the skip link keeps native jump + focus. Reduced motion: Lenis off, native anchors (re-evaluated if the preference changes).
- `components/motion/ScrollEffects.tsx` (client, in layout): one rAF-throttled scroll listener drives the 3px accent progress bar (scaleX = page progress), the staggered nav fade/lift/blur as the footer rises (`[data-nav-item]` in `[data-site-nav]`, nav stops taking clicks below 40%), the bar fading with the nav, and the footer corners flattening (36px → 0 over the last 260px). Math matches the design.
- Globals: no focus ring on `tabindex="-1"` targets (programmatic focus after anchor jumps).
- Package: `lenis`.

### Phase 10 — 3D logo (2026-10-04)
- `lib/scene/` (framework-free three.js, r186): `config` (hex centres, links, the five section poses, materials, studio, dust), `geometry` (rounded hex extrusions), `model` (chrome hexes + glowing plates + rods, particle cloud, PMREM studio reflections), `layout` (fit the logo into the free space above/beside each section's content; fractional stage from scroll), `animate` (per-frame hex/rod posing), `run` (renderer, loop, pointer, cleanup).
- `components/scene/LogoSceneLoader.tsx` → `LogoScene.tsx` (client): three.js loads as its own chunk via `next/dynamic` (`ssr: false`) once the browser is idle after first paint; fixed full-viewport layer between the backdrop and the page.
- Sections opt in with `data-scene-stage` and mark the content to avoid with `data-scene-anchor` (all five sections tagged).
- `lib/coreProgress.ts`: shared section-progress / active-core maths (Cores list + scene). `useActiveCore` now uses it.
- Behaviour (as designed): assembled logo above the hero copy → exploded beside the cores (the active core's hex lifts and glows) → stacked column with a running light beside Privacy → beside the phone → full turn above the closing CTA with the key light swelling. Hover lifts a hex (pointer cursor); pointer parallax, float and drift; accent dust cloud.
- Verified headlessly (bun): stage maths, core bands, smoothing, rods spanning hexes, stacked column order, no NaNs (24 checks).
- Packages: `three`, `@types/three` (dev).

### Design update 1 — launch-soon notice + footer (2026-10-04)
Diffed against the previous design file; only these changed (`design/` refreshed).
- CTAs are now buttons that show a "launching soon" notice instead of linking to #get: nav **Try it** and hero **Try it on web** → "NeuraOS for web"; **App Store** → "NeuraOS for iOS"; **Google Play** → "NeuraOS for Android". Same key looks as before.
- `components/parts/LaunchToast.tsx` (client, in layout) + `lib/launchToast.ts` (tiny external store): hand-built pill matching the design — bottom-centre, 28px up, logo + message + "Launching soon" tag; fades in 350ms / rises 16px over 450ms; hides after 2.6s; a new click replaces the message and restarts the timer. The pill is `aria-hidden`; a separate `role="status"` region announces "<message>. Launching soon." (re-announces repeats). Capped at viewport − 32px, message truncates on tiny phones.
- `components/parts/LaunchSoonButton.tsx` (client leaf): `Button` + `showLaunchToast`.
- Footer: "The clinical brief" block → **Follow the build** with three `night-sm` key links (X / Twitter, YouTube, LinkedIn; new tab, ↗, sr-only "(opens in a new tab)"). Spacer → centred Osler quote (`<figure>`/`<blockquote>`/`<figcaption>`) that fills the free height.
- Removed: newsletter form, `subscribe` Server Action, `field` text style, `accent-field` look and their tokens.
- Tokens: `night-key` / `night-key-end`, `shadow-key-night(-pressed)`, `shadow-toast`, `inset-shadow-badge`, `spacing-quote-y` / `-gap`, `duration-border` / `-toast-fade` / `-toast-move`. Text styles: `quote`, `attribution`, `toast`, `badge`. Look: `night-sm`.

## Next

1. Final pass: responsive / a11y / reduced-motion review across the page; tune anything you spot in the browser (wordmark `19.9cqi`, scene placement).
3. Global motion: Lenis smooth scroll + anchor scrolling, scroll progress bar, nav fade / footer sheet near the footer.
4. 3D logo scene (three.js), loaded client-only after first paint.

## Decisions

- Motion stack approved by the user: **Lenis** (smooth scroll) and **GSAP** (e.g. ScrollTrigger) may be used where they improve performance or feel, without breaking anything. Install them in the phase that needs them.
- Design-tool props fixed to their defaults: accent #2F6BFF, logo finish Chrome, motion 2, particles on.
- Git: one conventional commit per phase on `feat/landing-page` (main is the default branch); never push unless asked.
- No max-width container: full-bleed with fluid gutters, as designed.
- Nav below 640px (`sm`): section links hidden, brand + CTA kept (the full row needs ~460px; the design has no mobile nav).
- Buttons are `look`s (tone + size pairs from the design), not a free tone × size matrix, so every look has its exact shadow. A `<button>` version comes with the footer form.
- Hero reveal is CSS-only on first paint (no JS, h1 is the LCP); same timing as the design's observer. Below-fold sections will use an IntersectionObserver `Reveal` that applies the same `animate-reveal` tokens.
- Hero uses `min-h-svh` instead of `100vh` so the bottom copy isn't hidden behind mobile browser bars. Hero lead uses the shared `lead` line height (1.55; design 1.5).
- Cores active state uses a plain scroll listener, not GSAP ScrollTrigger: it only flips 6 times, so GSAP would add weight for nothing. The 3D phase can reuse the same progress math.
- Cores descriptions animate open/closed (design snaps them in) for a calmer list shift.
- Known contrast trade-off: inactive core names use `ghost` (#A3A9B5, ~2.4:1 on white) as designed — a deliberate focus dim; every name reaches full ink when active.
- Phone mockup is one labelled image for screen readers (status bar and UI chrome would be noise). Below ~340px viewports the fixed 318px phone is tight; revisit if small phones matter.
- Get the app keeps the shared page gutters (design: fixed 24px); invisible on centred content.
- GSAP not used so far: every scroll effect is a few style writes per frame from one listener, and Lenis covers smoothing and anchors. Adding GSAP + ScrollTrigger (~35KB gz) would buy nothing here; reconsider if a timeline-heavy effect comes up.
- Progress bar, nav fade and footer sheet share one component/listener instead of three (plan had NavFade / FooterSheet / ScrollProgress) — same behaviour, one scroll handler.
- 3D scene vs design: smoothing is frame-rate independent (design's per-frame lerps ran 2× faster on 120Hz screens); rendering pauses while the footer covers the viewport; half the particles below 640px; canvas fades in over 1s; accent and dust tint come from the CSS tokens. Dropped the design's unused intro, halo and outline lines. Reduced motion: no float, drift, parallax or running light (poses still follow scroll). No WebGL: nothing mounts.
- In-page and store links are plain `<a>` (no routes to prefetch); switch to `next/link` if internal pages appear.
- Type: display/headings fluid as designed; `lead`/`title` ease down on phones; UI text fixed; phone mockup text fixed (device illustration). All sizes in rem.
- Light theme only (design has no dark mode).
- No `tailwind-merge`: it would confuse custom color vs size classes (`text-ink` vs `text-[length:…]`). Use `clsx`.
- 3D scene only needs the 6 hex centres from `logo-contours.json` → inline constant; the design's unused intro/halo/outline code is dropped.
- Footer wordmark sized with container query units (`20.5cqi`) instead of JS measuring — tune visually.
- Cores: all descriptions stay in the DOM for screen readers; inactive ones collapse visually.
- Nav and footer links get the accent hover (the design's inline colors blocked it).
- Reduced motion: native scroll, no reveals, logo without float/parallax. No WebGL → logo omitted (decorative).
- Phone mockup logo is a different mark → keep `logo-white.png` via next/image.
- Next 16: `next/image` `priority` is deprecated → `preload`; no LCP image on this page (LCP is the h1).

## Open questions

- Real social profile URLs (`socialLinks` in `lib/content.ts`; the design uses each site's home page).
- Clinical / Company / Terms / Security footer links still point at `#top` (no pages yet).
- At launch: turn the `LaunchSoonButton`s back into store / web-app links (`launchCtas` in `lib/content.ts`).
