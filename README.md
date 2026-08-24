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

Cloudflare Pages (Git builds):

- Build command: `bun install --frozen-lockfile && bun run build`
- Output directory: `dist`
- Config: `wrangler.toml` (`pages_build_output_dir = "dist"`)
- Build env in committed `wrangler.toml` `[vars]`: `SKIP_DEPENDENCY_INSTALL`, `BUN_VERSION`, `VITE_*` (dashboard-only vars do not feed the pre-build install when this file exists)
- `.npmrc` (`legacy-peer-deps=true`) — safety net if Pages still runs `npm install`
- Contact: `functions/api/contact.ts`
- Agent gateway: `functions/_middleware.ts` + `static/_routes.json` (`/*`, assets excluded)
- Runtime secrets: `RESEND_API_KEY`, `FROM_EMAIL`, `TO_EMAIL` as encrypted Pages secrets (never in `wrangler.toml`)
- AI crawlers: `static/robots.txt` allows GPTBot, ChatGPT-User, ClaudeBot, PerplexityBot, Google-Extended, and DeepSeekBot. Two **vishalk.com** zone settings currently override that file on the apex (previews on `*.pages.dev` do not):
  1. **Managed robots.txt** prepends `# BEGIN Cloudflare Managed content` and `Disallow: /` for GPTBot, ClaudeBot, and Google-Extended. Security → Bots → Manage your robots.txt → **Disable robots.txt configuration** (or AI Crawl Control: do not rewrite robots.txt). Confirm `curl -sS https://vishalk.com/robots.txt` has no managed block and those agents `Allow: /`.
  2. **WAF / Block AI bots** returns “Attention Required” 403 for GPTBot, ChatGPT-User, ClaudeBot, and PerplexityBot. Security → WAF → Custom rules → Create rule. Expression:

     `(http.user_agent contains "GPTBot") or (http.user_agent contains "ChatGPT-User") or (http.user_agent contains "ClaudeBot") or (http.user_agent contains "PerplexityBot") or (http.user_agent contains "Google-Extended") or (http.user_agent contains "DeepSeekBot")`

     Action: **Skip**. Tick Super Bot Fight Mode, Bot Fight Mode, and Block AI bots. Put the rule at the top. Or Security → Bots: turn off “Block AI Scrapers and Crawlers” / allow those agents in AI Crawl Control. Confirm with `curl -A 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.2; +https://openai.com/gptbot)' -o /dev/null -w '%{http_code}' https://vishalk.com/` → 200.

  Live check: `bun scripts/verify-agent-readiness.mjs https://vishalk.com` (preview: `bun scripts/verify-agent-readiness.mjs https://cursor-agent-readiness-2a91.vishalk.pages.dev`).
  Zone apply (needs `CLOUDFLARE_API_TOKEN` with Bot Management Write + WAF Write): `bun scripts/allow-ai-crawlers.mjs`.

Deep links ship as build-time HTML shells under `dist/` (correct title / description / OG / canonical per Mode and Work Case). Unknown paths serve `404.html` with HTTP 404 (SPA fallback is off). Markdown is available on the same URLs via `Accept: text/markdown`.

## Agent / product docs

- Domain glossary: `CONTEXT.md`
- Issue tracker: Obsidian vault `pro` — see `docs/agents/issue-tracker.md` and skill `pro-vault`
- Spec: SolidJS 2 App Shell portfolio rewrite (pro vault)
