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
- Git build command: `bun install --frozen-lockfile && bun run build`. Non-secret build env (`SKIP_DEPENDENCY_INSTALL`, `BUN_VERSION`, `VITE_*`) lives in committed `wrangler.toml` `[vars]` — dashboard-only vars are not applied to the pre-build install when this file is present.
- Build stamps per-path HTML meta shells for the finite Mode + Work Case deep-link set (`src/meta/`); full-body SSR is not required.
- Contact form: Pages Function `POST /api/contact` → Resend via `fetch` (`functions/api/contact.ts`).
- Secrets: `RESEND_API_KEY`, `FROM_EMAIL`, `TO_EMAIL` as Pages **encrypted secrets** only (never in `wrangler.toml`, never `VITE_`-prefixed).
- Public build env (baked into the client bundle): `VITE_HIRE_SIGNAL`, `VITE_GOOGLE_ANALYTICS_ID` (GA4; blank disables).
- Functions scope: `dist/_routes.json` include `/*` with `/assets/*` and `/fonts/*` excluded (copied from `static/_routes.json`). Contact stays `POST /api/contact`. Middleware negotiates `Accept: text/markdown` and returns HTTP 404 for unknown paths.
- Agent files: `dist/llms.txt`, `dist/sitemap.xml`, per-path `.md` siblings, crawler HTML + JSON-LD in stamped shells. `static/robots.txt` explicitly allows GPTBot, ChatGPT-User, ClaudeBot, PerplexityBot, Google-Extended, and DeepSeekBot. Apex currently serves origin `robots.txt` and those UAs (confirm with `bun scripts/verify-agent-readiness.mjs https://vishalk.com`). If managed robots.txt / Content Signals (`cf_robots_variant`) or WAF “Block AI bots” is turned back on, they hide origin again — disable them or run `bun scripts/allow-ai-crawlers.mjs` (README Deploy). `*.pages.dev` previews do not get the zone overlay.

## Testing

- Vitest Browser Mode (Playwright **Chromium** only) for App Shell / theme UI seams; Node project for the FOUC `index.html` structural contract.
- Chromium instance `setupFiles` loads `vitest.browser.setup.ts` (shared global CSS) — do not rely on per-suite `styles.css` imports or on `main.tsx`.
- Filename suffixes: `*.browser.test.ts(x)` → browser project; `*.node.test.ts` → node project.
- Solid render: keep `@solidjs/testing-library`, bridge with `page.elementLocator` — do not adopt `vitest-browser-solid`.
- Dropped: `jsdom`, `@testing-library/jest-dom` (matchers/interactions come from Vitest Browser Mode).
- Chromium binaries: `bun run test:install` (`playwright install chromium`); not on `prepare` / every `bun install`. Quality CI installs with `--with-deps` and caches `~/.cache/ms-playwright`.

## Capabilities (not a file tree)

- Modes: Work, About, Resume, Contact (URL grammar lives in the router / `src/app.tsx` — explore there).
- Theme preference: `system` | `light` | `dark` in `localStorage` key `vk-theme`; FOUC-safe boot in `index.html`.
- `.scratch/` is wayfinder research / prototypes, not the issue tracker.
