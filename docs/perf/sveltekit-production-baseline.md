# SvelteKit production performance baseline

Captured for ticket **18 — Run performance cutover gate vs baseline**.
Do not re-measure production SvelteKit for cutover — compare rewrite numbers to this artifact.

| Field | Value |
| --- | --- |
| Captured at (UTC) | 2026-07-18T13:46:54.406Z |
| Site | https://vishalk.com |
| Tooling | lighthouse CLI (Chrome/Edge path: C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe) |
| Form factor | mobile (lab) |
| Aggregation | median of 3 runs |
| Theme | default System→resolved (production default; measured once, no dual light/dark gate) |

## Gate metrics (median)

| Locked path | Kind | Measured URL | LCP (ms) | CLS | Compressed first-load JS |
| --- | --- | --- | --- | --- | --- |
| `/` | direct | `https://vishalk.com/` | 3534 | 0.000 | 86.1 KiB (88208) |
| `/work/labor-solutions/engage-reporting` | stand-in | `https://vishalk.com/` | 3534 | 0.000 | 86.1 KiB (88208) |
| `/resume` | stand-in | `https://vishalk.com/` | 3534 | 0.000 | 86.1 KiB (88208) |
| `/contact` | direct | `https://vishalk.com/contact` | 3826 | 0.000 | 68.8 KiB (70424) |

## Notes

- **home** (`/`): Current SvelteKit home is marketing About+Work+Contact, not SupplyChain+.
- **internal-dossier** (`/work/labor-solutions/engage-reporting`): Engage reporting has no dedicated SvelteKit route (404). Work content loads on the home document; first-load metrics match `/`.
- **resume** (`/resume`): No Resume Surface on SvelteKit (`/resume` 404). Recorded home first-load as SPA shell budget stand-in; PDF-specific LCP does not exist yet.
- **contact** (`/contact`): Document load only — form submit not exercised.

## Machine-readable

See `docs/perf/sveltekit-production-baseline.json`.
