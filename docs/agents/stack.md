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
- Contact form: Pages Function `POST /api/contact` → Resend via `fetch` (`functions/api/contact.ts`).
- Secrets: `RESEND_API_KEY`, `FROM_EMAIL`, `TO_EMAIL` in Pages env only (never `VITE_`-prefixed).
- Functions scope: `dist/_routes.json` include `/api/*` only (copied from `static/_routes.json`).

## Testing

- Vitest Browser Mode (Playwright **Chromium** only) for App Shell / theme UI seams; Node project for the FOUC `index.html` structural contract.
- Filename suffixes: `*.browser.test.ts(x)` → browser project; `*.node.test.ts` → node project.
- Solid render: keep `@solidjs/testing-library`, bridge with `page.elementLocator` — do not adopt `vitest-browser-solid`.
- Dropped: `jsdom`, `@testing-library/jest-dom` (matchers/interactions come from Vitest Browser Mode).
- Chromium binaries: `bun run test:install` (`playwright install chromium`); not on `prepare` / every `bun install`. Quality CI installs with `--with-deps` and caches `~/.cache/ms-playwright`.

## Capabilities (not a file tree)

- Modes: Work, About, Resume, Contact (URL grammar lives in the router / `src/app.tsx` — explore there).
- Theme preference: `system` | `light` | `dark` in `localStorage` key `vk-theme`; FOUC-safe boot in `index.html`.
- `.scratch/` is wayfinder research / prototypes, not the issue tracker.
