# AGENTS.md

Personal portfolio for [vishalk.com](https://vishalk.com): a SolidJS 2 CSR App Shell (Triptych Dock over Work, About, Resume, and Contact).

Use Bun (not npm or yarn).

Non-standard commands:

- `bun check` — TypeScript (`tsc --noEmit`); type SoT, not the linter
- `bun run test` — Vitest (`bun test` is Bun's runner, not this script)
- `bun lint` / `bun format` — oxlint + oxfmt
- Lefthook pre-commit — staged oxfmt + oxlint only (`bun install` / `prepare` installs hooks; not full check/test)

Domain terms live in `CONTEXT.md`. For how to use domain docs and ADRs, see `docs/agents/domain.md`.

Issue tracking is Obsidian vault `pro` (Project → Spec → Ticket), not GitHub Issues or `.scratch/`. See `docs/agents/issue-tracker.md`, `docs/agents/triage-labels.md`, and the project skill `pro-vault`.

For SolidJS 2 / build / deploy constraints, see `docs/agents/stack.md`.
For the SvelteKit perf cutover baseline, see `docs/agents/perf-baseline.md`.
