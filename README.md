# NeuraOS client

Medical AI chat for Indian healthcare professionals. Next.js App Router, Firebase, Gemini on Vertex AI.

## Team setup

Fork NeuraDataHealth/neuraos-client-web on GitHub, then:

```bash
git clone <your fork URL>
cd neuraos-client-web
git remote add upstream https://github.com/NeuraDataHealth/neuraos-client-web.git
git fetch upstream
git checkout -b alpha-launch upstream/alpha-launch
bun install
cp .env.example .env.local   # Dhruti shares the values later
```

Then open your coding agent and say: "I'm <name>. Read AGENTS.md and docs/TASKS.md and start my next task."

Branches, PRs and folder ownership are in `AGENTS.md` ("Team"). The spec is `docs/SPEC.md`. Run the app with `bun run dev`.
