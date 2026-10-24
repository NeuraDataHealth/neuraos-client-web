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

# Team

`docs/SPEC.md` is the source of truth; `docs/TASKS.md` is each person's checklist. Work happens in forks; PRs go into `alpha-launch` on NeuraDataHealth/neuraos-client-web.

## Ownership
- **Dhruti (lead, backend):** app/api/**, lib/server/**, lib/firebase/**, lib/api/**, lib/types.ts, lib/contracts/**, lib/limits.ts, hooks/useAuth.ts, components/AuthProvider.tsx, components/RequireAuth.tsx, app/(app)/layout.tsx, app/admin/layout.tsx, app/sign-in/layout.tsx, firestore.rules, storage.rules, package.json, bun.lock
- **Dibyanshu (chat UI):** app/(app)/chat/**, app/(app)/join/**, components/chat/** (including ChatSidebar.tsx), hooks/chat/**
- **Ashish (account and admin UI):** app/(app)/profile/**, app/(app)/verify/**, app/(app)/contribute/**, app/admin/** except layout.tsx, app/sign-in/** except layout.tsx, components/account/** (including UserCard.tsx, which Dibyanshu renders at the bottom of ChatSidebar), components/admin/**, hooks/account/**
- **Shared UI** (components/ui/**, styles/**, app/globals.css): add new things freely; don't change existing ones without telling the team.
- You may import from another person's folder, but don't edit their files.

## Rules
- The UI calls the backend only through `lib/api/client.ts`, and gets the user from `useAuth()`. It reads Firestore directly with `lib/firebase/client.ts` and never writes to Firestore or Storage.
- Never commit .env files or keys.
- Fictional data only, never real patient details. Never log message text, transcripts, file contents or contribution text.

## Git workflow
- `origin` = your own fork; `upstream` = NeuraDataHealth/neuraos-client-web.
- Start each task: `git fetch upstream && git checkout -b feat/<name>-<task> upstream/alpha-launch`
- Before pushing: `bun run lint`, `bun run typecheck`, `git fetch upstream`, `git rebase upstream/alpha-launch`
- Push to your fork: `git push -u origin feat/<name>-<task>`
- Open a PR from your fork's branch into NeuraDataHealth/neuraos-client-web : `alpha-launch`. Title "[name] what it does". One task per PR, keep it small.
- Only touch files in your own folders. A PR that edits someone else's folders, lib/, or package.json gets sent back.
- Need a new field, route, limit or package? Ask Dhruti.
- Agents never push or open PRs on their own; the person does.
