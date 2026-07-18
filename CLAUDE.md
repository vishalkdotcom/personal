# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal portfolio for [vishalk.com](https://vishalk.com): a SolidJS 2 CSR **App Shell** (Triptych Dock over Work, About, Resume, and Contact). Domain terms live in root `CONTEXT.md`.

## Development Commands

```bash
# Install dependencies (Bun)
bun install

# Dev server
bun dev

# Production build → dist/
bun run build

# Preview production build
bun preview

# Typecheck
bun check

# Unit / seam tests
bun test
bun test:watch

# SvelteKit production perf baseline (cutover gate artifact; do not re-measure casually)
bun run perf:baseline
bun run perf:baseline:test
```

## Architecture

### Project Structure
- **`index.html`**: CSR entry + FOUC-safe theme blocking script (`vk-theme`)
- **`src/main.tsx`**: Mounts `@solidjs/web` `render` + `@solidjs/router`
- **`src/app.tsx`**: Mode URL grammar and App Shell root
- **`src/shell/`**: App Shell chrome (brand row today; Triptych Dock next)
- **`src/stages/`**: Center-stage surfaces (stubs until Mode/Work tickets land)
- **`src/theme/`**: System / Light / Dark preference + brand-row control
- **`static/`**: Public assets copied into `dist/`
- **`scripts/perf/`**: Lighthouse baseline capture for cutover comparison
- **`docs/perf/`**: Stored SvelteKit production baseline artifacts
- **`.scratch/`**: Wayfinder research / prototypes (not the issue tracker)

### Stack
- **UI**: SolidJS 2 (`solid-js` / `@solidjs/web` exact betas), `@solidjs/router`, `@solidjs/meta`
- **Build**: Vite + `vite-plugin-solid` (exact beta); `resolve.dedupe` for Solid packages
- **Language**: TypeScript strict; `jsxImportSource: "@solidjs/web"`
- **Deploy**: Cloudflare Pages static `dist/` (`wrangler.toml` `pages_build_output_dir`)
- **Contact (later)**: Pages Function `POST /api/contact` → Resend — not in the scaffold yet

### URL grammar (Modes)
| Path | Surface |
| --- | --- |
| `/` | Featured Public Storefront (SupplyChain+) |
| `/about` | About Mode |
| `/resume` | Resume Surface |
| `/contact` | Contact Mode |
| `/work/<folder-slug>` | Work Folder index |
| `/work/<folder-slug>/<case-slug>` | Work Case |

### Theme
- Preference: `system` \| `light` \| `dark` in `localStorage` key `vk-theme`
- Inline script in `index.html` sets `document.documentElement.dataset.theme` before CSS paint
- Brand-row control cycles the preference

## TypeScript Configuration
- Strict mode; `jsx: "preserve"`, `jsxImportSource: "@solidjs/web"`
- Path alias `~/*` → `src/*`
- Check with `bun check` (`tsc --noEmit`)

## Agent skills

### Issue tracker

Work lives in Tolaria vault `pro` via MCP as Project → Spec → Issue (not GitHub Issues or `.scratch/`). See `docs/agents/issue-tracker.md`.

### Triage labels

Default vocabulary: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: root `CONTEXT.md` + `docs/adr/`. See `docs/agents/domain.md`.
