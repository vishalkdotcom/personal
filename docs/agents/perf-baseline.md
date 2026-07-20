# Perf baseline (cutover gate)

The SvelteKit production Lighthouse capture under `scripts/perf/` and artifacts in `docs/perf/` are a **cutover comparison baseline**.

- Do not re-measure production SvelteKit casually.
- Ticket **18** compares the SolidJS 2 rewrite to the checked-in baseline artifact only.

```bash
# Refresh SvelteKit production baseline (rare — ticket 01)
bun run perf:baseline
bun run perf:baseline:test

# Measure rewrite vs checked-in baseline (ticket 18)
bun run build
bun run perf:cutover
bun run perf:cutover:test
```

Optional: `PERF_BASE_URL=https://… bun run perf:cutover` to point at a deploy preview instead of local `dist/` (gzip + Pages pretty URLs; ephemeral port, or `PERF_PORT`). Prefer a preview URL when claiming LCP clearance against the production baseline host.

Lab tooling defaults: cutover → Playwright + lighthouse programmatic; baseline capture → lighthouse CLI (Chrome/Edge) with PSI fallback. Override with `PERF_LAB_TOOLING=playwright|cli|psi`.

Hard gates: lab-mobile LCP and compressed first-load JS (fail only if worse beyond ~10% noise). CLS is a soft floor (fail only if it leaves the good band, CLS > 0.1). Not gates: Lighthouse score, TTI, TBT, INP, field RUM.
