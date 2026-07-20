# Stack constraints

Read this when changing dependencies, build config, JSX/TS setup, or deploy wiring.

## Runtime / UI

- SolidJS 2 CSR App Shell (not SvelteKit, not SSR-first).
- Pin `solid-js`, `@solidjs/web`, and related Solid packages to the exact betas in `package.json` — do not float to latest.
- Router / meta: `@solidjs/router`, `@solidjs/meta`.

## Build / language

- Vite + `vite-plugin-solid` (exact beta in `package.json`).
- Keep Vite `resolve.dedupe` for Solid packages when touching the Vite config.
- TypeScript strict; `jsxImportSource` is `@solidjs/web` (see `tsconfig`).
- Path alias `~/*` → `src/*`.

## Deploy

- Cloudflare Pages static output: `dist/` (`wrangler.toml` `pages_build_output_dir`).
- Contact form (`POST /api/contact` → Resend) is planned later — not in the scaffold yet.

## Capabilities (not a file tree)

- Modes: Work, About, Resume, Contact (URL grammar lives in the router / `src/app.tsx` — explore there).
- Theme preference: `system` | `light` | `dark` in `localStorage` key `vk-theme`; FOUC-safe boot in `index.html`.
- `.scratch/` is wayfinder research / prototypes, not the issue tracker.
