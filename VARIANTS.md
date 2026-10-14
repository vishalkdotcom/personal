# Creative Site Editions (`vishalk.com` — `personal` repo)

Four complete, non-verbose, evidence-first creative variants for `vishalk.com` built on SolidJS 2 + Tailwind v4. Each variant is available in **two ways**:

1. **Embedded Interactive Proof Studio** on `/` and `/about` inside the Triptych App Shell (switchable via the `01 Ledger` · `02 Monograph` · `03 Deck` · `04 Signal` pill bar).
2. **Full-Bleed Standalone Canvas Edition** that replaces the entire viewport with a bespoke experience (launch via the bottom-right `Full-Canvas Editions` pill bar, keyboard shortcuts `Alt+1`..`Alt+4` / `Alt+0`, or direct URL query parameters):
   - **`/?v=ledger`** (`/?v=1`) — **01 · Proof Ledger & Counterexample Lab**: Swiss architectural ledger with an interactive 8-facility scoring parity simulator (toggle facilities to see why Trino Question-First `54.90%` vs. Pandas Facility-First `54.31%` drifted), `hyperfine` Next.js 16 build speedup bars (`84.5s → 40.6s`, `2.08×`), MDXEditor vs. candidate gzip bundle comparison (`164 KiB` vs `350 KiB`), and visual system dossiers with screenshot lightboxes.
   - **`/?v=monograph`** (`/?v=2`) — **02 · The Engineering Monograph**: Broadsheet technical publication (*Vol. XIII · No. 144*) featuring three column dispatches (*One Scoring Authority*, *The Confident "No"*, *Measured Velocity*), a Runtime Trade-Off Matrix (RTK on App Router SSR vs. Zustand on React Native), and an illustrated Plate Index (`PLATES I – X`).
   - **`/?v=command`** (`/?v=3`) — **03 · Command Deck & PR Gatekeeper**: Keyboard-first `pwsh 7.5 · chezmoi` engineering workbench with live stack/domain search, an interactive **PR #155 Review Gatekeeper Inspector** (inspect all 6 merge-blocking customer-analytics defects caught before merge), and 1-click launchers for live apps (`SupplyChain+`, `PromptSurvey`, `Snap2Paper`, `PhotoGrid`, `PDFGrid`) and open-source tools (`April`, `EduCal`, `Agent Skills`, `Dotfiles`).
   - **`/?v=signal`** (`/?v=4`) — **04 · Ten-Second Signal Index**: Ultra-minimalist Swiss executive index that fits on a single desktop viewport with instant hover screenshot plates, 4-metric proof strip, and 1-click email copy / Resume PDF drawer.

> **Note:** `awesomeapps.org` is excluded across all variants until public launch.

## Locking Any Variant as the Default

In [`src/variants/variant-store.ts`](./src/variants/variant-store.ts), set `DEFAULT_SITE_VARIANT`:

```ts
export const DEFAULT_SITE_VARIANT: SiteVariantId = "ledger"; // "ledger" | "monograph" | "command" | "signal"
```
