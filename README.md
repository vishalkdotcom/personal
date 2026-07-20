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
| `bun test` | Vitest (App Shell seams) |

## Deploy

Cloudflare Pages:

- Build command: `bun run build`
- Output directory: `dist`
- Config: `wrangler.toml` (`pages_build_output_dir = "dist"`)

Deep links rely on Pages’ default SPA fallback (no top-level `404.html`).

## Agent / product docs

- Domain glossary: `CONTEXT.md`
- Issue tracker: Tolaria vault `pro` — see `docs/agents/issue-tracker.md`
- Spec: SolidJS 2 App Shell portfolio rewrite (Tolaria)
