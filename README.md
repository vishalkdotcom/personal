# vishalk.com

SolidJS 2 CSR App Shell portfolio for [vishalk.com](https://vishalk.com). Desktop Triptych Dock over Work, About, Resume, and Contact Modes. Glossary: [`CONTEXT.md`](./CONTEXT.md).

## Stack

- SolidJS 2 + Vite + `vite-plugin-solid`
- `@solidjs/router` + `@solidjs/meta`
- Cloudflare Pages (`dist/`)

Solid package versions are pinned to exact betas in `package.json`.

## Setup

```bash
bun install
bun dev
```

`bun install` enables Lefthook via the `prepare` script (`lefthook install`). Pre-commit runs oxfmt + oxlint on staged files only — not full `bun check` / `bun run test`. Skip once with `LEFTHOOK=0 git commit`.

## Scripts

| Command | Purpose |
| --- | --- |
| `bun dev` | Vite dev server |
| `bun run build` | Production build → `dist/` |
| `bun preview` | Preview the production build |
| `bun check` | TypeScript (`tsc --noEmit`) |
| `bun lint` | Oxlint over the in-scope tree |
| `bun format` | Oxfmt write fixes |
| `bun format:check` | Oxfmt check (CI / dirty tree) |
| `bun run test` | Vitest (App Shell seams) |
| `bun prepare` | Install Lefthook git hooks (also runs after `bun install`) |

## Deploy

Cloudflare Pages:

- Build command: `bun run build`
- Output directory: `dist`
- Config: `wrangler.toml` (`pages_build_output_dir = "dist"`)
- Contact: `functions/api/contact.ts` + `static/_routes.json` (`/api/*` only)
- Env secrets: `RESEND_API_KEY`, `FROM_EMAIL`, `TO_EMAIL` (Pages dashboard; never client-shipped)

Deep links ship as build-time HTML shells under `dist/` (correct title / description / OG / canonical per Mode and Work Case). Unknown paths still use Pages’ SPA fallback (no top-level `404.html`).

## Agent / product docs

- Domain glossary: `CONTEXT.md`
- Issue tracker: Obsidian vault `pro` — see `docs/agents/issue-tracker.md` and skill `pro-vault`
- Spec: SolidJS 2 App Shell portfolio rewrite (pro vault)
