<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Project rules

## Stack
- Next.js App Router, TypeScript, Bun as the package manager (never npm, yarn or pnpm, never another lockfile). Check package.json for exact versions and whether Tailwind is installed.
- Follow the Next.js block above: read the relevant guide in node_modules/next/dist/docs/ before using any Next.js API.

## Structure (inside src/ if it exists, otherwise at the repo root)
- app/: routes, layout, globals.css (design tokens live here)
- components/ui/: reusable primitives (Text, Button, Container, Section, Link)
- components/sections/: one file per page section, composed in app/page.tsx
- styles/fonts.ts: the only place fonts are loaded (next/font)
- styles/typography.ts: the only place text styles are defined
- hooks/, lib/: shared hooks, helpers, constants

## Code rules
- Server Components by default. Use 'use client' only for state, effects or browser APIs, on the smallest leaf component.
- One component per file, PascalCase, named export, typed props, under 200 lines.
- All text is rendered through <Text variant="..."> from styles/typography.ts. No font-size, weight, line-height, letter-spacing or font-family anywhere else. Need a new style? Add a variant first.
- Variants use fluid sizes with clamp() and come from the design's real type scale.
- Colors, spacing, radii and durations are tokens in globals.css. No hardcoded hex values in components.
- Build mobile-first and responsive.
- Images use next/image (explicit size, or fill + sizes). `priority` only on the LCP image.
- Semantic HTML, one h1 per page, alt text, visible focus styles, respect prefers-reduced-motion.
- No `any`, no @ts-ignore, no dead code.
