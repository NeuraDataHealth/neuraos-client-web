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

## Next

1. **Phase 2 — Nav**: Button (accent/dark/light × sm/md/lg key press), Link, LogoMark (inline SVG, currentColor), `lib/content.ts`, `SiteNav`.
2. Hero → Cores → Privacy → App (PhoneMockup) → Get the app → Footer, one at a time.
3. Global motion: Lenis smooth scroll + anchor scrolling, scroll progress bar, nav fade / footer sheet near the footer, reveals.
4. 3D logo scene (three.js), loaded client-only after first paint.

## Decisions

- Motion stack approved by the user: **Lenis** (smooth scroll) and **GSAP** (e.g. ScrollTrigger) may be used where they improve performance or feel, without breaking anything. Install them in the phase that needs them.
- Design-tool props fixed to their defaults: accent #2F6BFF, logo finish Chrome, motion 2, particles on.
- No max-width container: full-bleed with fluid gutters, as designed.
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
