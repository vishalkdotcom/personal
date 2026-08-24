Improve agent readiness for https://vishalk.com (Is Agentic was 26/100 on the apex). Origin behavior is implemented and verified on the Cloudflare Pages preview.

## What landed

1. Real HTTP 404 for unknown paths, with a short markdown/HTML body pointing at `/sitemap.xml` and `/llms.txt` — never an SPA 200.
2. Homepage crawler HTML with an H1 and 500+ characters without JavaScript (clipped so the App Shell visual design is unchanged).
3–4. `robots.txt` Allow groups for GPTBot, ChatGPT-User, ClaudeBot, PerplexityBot, Google-Extended, and DeepSeekBot, plus a Cloudflare zone script/workflow to disable managed robots.txt and skip Bot Fight / Block AI bots for those UAs.
5. Markdown content negotiation via `Accept: text/markdown`, `Content-Type: text/markdown; charset=utf-8`, and `Vary` including `Accept`.
6. In-repo brand identity for “Vishal Kumar”: consistent NAP, `sameAs` (LinkedIn + GitHub), Person + Organization JSON-LD. SERP indexing is out of repo.
7. Homepage JSON-LD Person identity.
8. `/llms.txt` with a specific **When to use this** section.
9. `/sitemap.xml` with `lastmod` on every URL.
10. Organization JSON-LD with `contactPoint` and `PostalAddress`.
11. Real `/about`, `/contact`, and `/privacy` pages with 500+ characters each.

Tests cover 404s (including omitted `Accept` and `*/*`), markdown negotiation, JSON-LD, llms.txt, sitemap lastmod, robots allow groups, and trust-page length.

## Preview (this branch)

- https://cursor-agent-readiness-2a91.vishalk.pages.dev
- Is Agentic: **100/100** essential (remaining recommended miss is brand SERP for “Vishal Kumar”, not a code change)
- `bun scripts/verify-agent-readiness.mjs https://cursor-agent-readiness-2a91.vishalk.pages.dev`

## After merge (apex)

Production still serves the previous SPA until this lands on `main`. After deploy, two **vishalk.com** zone settings still override origin:

1. Disable Cloudflare managed robots.txt (Security → Bots).
2. Skip Super Bot Fight Mode / Block AI bots for the six UAs (README Deploy), or set `CLOUDFLARE_API_TOKEN` (Bot Management Write + WAF Write) on the Production GitHub environment so `Allow AI crawlers` can apply `scripts/allow-ai-crawlers.mjs`.

Then: `bun scripts/verify-agent-readiness.mjs https://vishalk.com`

Do not add Privacy to Mode nav. No public phone on Organization schema.
