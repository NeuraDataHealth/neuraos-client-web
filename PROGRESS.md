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

## Next

1. **Phase 7 — Get the app**: "Bring it your hardest case." + App Store / Google Play keys + disclaimer.
2. Footer, then global motion, then the 3D logo.
3. Global motion: Lenis smooth scroll + anchor scrolling, scroll progress bar, nav fade / footer sheet near the footer.
4. 3D logo scene (three.js), loaded client-only after first paint.

## Decisions

- Motion stack approved by the user: **Lenis** (smooth scroll) and **GSAP** (e.g. ScrollTrigger) may be used where they improve performance or feel, without breaking anything. Install them in the phase that needs them.
- Design-tool props fixed to their defaults: accent #2F6BFF, logo finish Chrome, motion 2, particles on.
- Git: one conventional commit per phase on `feat/landing-page` (main is the default branch); never push unless asked.
- No max-width container: full-bleed with fluid gutters, as designed.
- Nav below 640px (`sm`): section links hidden, brand + "Get the app" kept (the full row needs ~460px; the design has no mobile nav).
- Buttons are `look`s (tone + size pairs from the design), not a free tone × size matrix, so every look has its exact shadow. A `<button>` version comes with the footer form.
- Hero reveal is CSS-only on first paint (no JS, h1 is the LCP); same timing as the design's observer. Below-fold sections will use an IntersectionObserver `Reveal` that applies the same `animate-reveal` tokens.
- Hero uses `min-h-svh` instead of `100vh` so the bottom copy isn't hidden behind mobile browser bars. Hero lead uses the shared `lead` line height (1.55; design 1.5).
- Cores active state uses a plain scroll listener, not GSAP ScrollTrigger: it only flips 6 times, so GSAP would add weight for nothing. The 3D phase can reuse the same progress math.
- Cores descriptions animate open/closed (design snaps them in) for a calmer list shift.
- Known contrast trade-off: inactive core names use `ghost` (#A3A9B5, ~2.4:1 on white) as designed — a deliberate focus dim; every name reaches full ink when active.
- Phone mockup is one labelled image for screen readers (status bar and UI chrome would be noise). Below ~340px viewports the fixed 318px phone is tight; revisit if small phones matter.
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

- Newsletter form: where should submissions go? (Design has a static field.)
- Real URLs for App Store, Google Play and footer links (all `#` in the design).
