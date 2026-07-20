# Perf baseline (cutover gate)

The SvelteKit production Lighthouse capture under `scripts/perf/` and artifacts in `docs/perf/` are a **cutover comparison baseline**.

- Do not re-measure casually.
- Run only when deliberately refreshing or comparing against that gate:

```bash
bun run perf:baseline
bun run perf:baseline:test
```
