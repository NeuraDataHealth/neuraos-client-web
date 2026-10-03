@AGENTS.md

# Claude Code workflow

## Running things
- Never start the dev server or run build/start commands (bun run dev, bun run build, bun run start, next dev). I run the app and check the UI myself.
- After every change run `bun run lint` and `bunx tsc --noEmit`, fix everything they report, then stop.
- Install the packages the work needs with `bun add` (or `bun add -d`). Prefer well-maintained packages, don't duplicate what is already installed, and list what you added in your summary.

## Design source
- `design/` holds the Claude Design handoff bundle. It is reference only: rebuild it as real React components, never copy its HTML, CSS or JS into the app.
- Exclude `design/` from ESLint and from tsconfig so lint and type checks skip it.
- Match spacing, colors, type scale and layout. If something is missing or unclear, choose sensibly and list the choice in your summary instead of stopping.

## Working style
- For anything touching more than 3 files, write a short plan first and wait for my approval.
- Work in phases: foundation (fonts, tokens, typography, layout), then sections one at a time. Finish one phase before starting the next.
- Keep PROGRESS.md at the project root (done, next, decisions). Read it at the start of every session and update it when you finish.
- Don't commit or push unless I ask.
- End every task with 2-3 lines: what changed, what is left. Don't paste code back.
