# SolidJS 2 performance cutover gate

Measured for ticket **18 — Run performance cutover gate vs baseline**.
Compared against checked-in `docs/perf/sveltekit-production-baseline.json` — production SvelteKit was **not** re-measured.

| Field | Value |
| --- | --- |
| Overall verdict | **PASS** |
| Cutover blocked | no |
| Environment class | local-lab |
| Captured at (UTC) | 2026-07-20T16:49:16.721Z |
| Rewrite base URL | http://127.0.0.1:63365 |
| Baseline artifact | 2026-07-18T13:46:54.406Z @ https://vishalk.com |
| Tooling | lighthouse programmatic + Playwright Chromium (lab mobile) |
| Form factor | mobile (lab) |
| Aggregation | median of 3 runs |
| Hard noise band | fail only if worse than baseline by more than ~10% |
| CLS soft floor | fail only if CLS > 0.1 (leaves good band) |
| Theme | default System→resolved (measured once, no dual light/dark gate) |

## Environment note

Rewrite measured on **local-lab** (`dist/` over loopback with gzip). Baseline is production SvelteKit. Lighthouse applies lab mobile simulation on both; local TTFB is near-zero, so treat LCP as lab-comparative under that caveat. Compressed first-load JS remains the primary transfer apples-to-apples check. Set `PERF_BASE_URL` to a rewrite deploy preview for a closer host match.

## Per-URL gate metrics (rewrite / baseline)

| Locked path | LCP (ms) | CLS | Compressed first-load JS | Verdict |
| --- | --- | --- | --- | --- |
| `/` | 1482 / 3534 (-58.1%) | 0.000 / 0.000 | 33.5 KiB / 86.1 KiB (-61.1%) | hard pass; CLS soft pass |
| `/work/labor-solutions/engage-reporting` | 1480 / 3534 (-58.1%) | 0.000 / 0.000 | 33.5 KiB / 86.1 KiB (-61.1%) | hard pass; CLS soft pass |
| `/resume` | 1494 / 3534 (-57.7%) | 0.000 / 0.000 | 33.5 KiB / 86.1 KiB (-61.1%) | hard pass; CLS soft pass |
| `/contact` | 1487 / 3826 (-61.1%) | 0.010 / 0.000 | 33.5 KiB / 68.8 KiB (-51.3%) | hard pass; CLS soft pass |

## Non-gates (recorded policy — not evaluated)

- lighthousePerformanceScore
- tti
- tbt
- inp
- fieldRum
- crux

## Cutover decision

Cutover gate **cleared** on lab metrics (LCP, compressed first-load JS, CLS soft floor).

## Notes

- **home** (`/`): Document load of featured Public Storefront home.
- **internal-dossier** (`/work/labor-solutions/engage-reporting`): Document load of Engage reporting Internal Dossier.
- **resume** (`/resume`): Document load of Resume Surface (PDF path present in shell).
- **contact** (`/contact`): Document load only — form submit not exercised.

## Machine-readable

See `docs/perf/solidjs-cutover-gate.json`.
