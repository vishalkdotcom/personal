/**
 * Capture production SvelteKit lab-mobile baseline for the locked URL matrix.
 * Artifact: docs/perf/sveltekit-production-baseline.json (+ .md)
 *
 * Usage:
 *   node scripts/perf/capture-sveltekit-baseline.mjs
 *   node scripts/perf/capture-sveltekit-baseline.mjs --runs=5
 *
 * Requires Chromium (Chrome or Edge). Set CHROME_PATH to override discovery.
 * Fallback: set PAGESPEED_API_KEY to use PageSpeed Insights API instead.
 * Do not re-run casually — compare cutover against the checked-in artifact.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { formatBytes, sveltekitBaselineTargets } from "./locked-matrix.mjs";
import { measureUrl, resolveLabTooling } from "./lighthouse-lab.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "../..");
const outDir = join(repoRoot, "docs/perf");
const outJson = join(outDir, "sveltekit-production-baseline.json");
const outMd = join(outDir, "sveltekit-production-baseline.md");
const scratchDir = join(repoRoot, ".tmp/lighthouse-runs");

const BASE = process.env.PERF_BASE_URL || "https://vishalk.com";
const RUNS = Number(process.argv.find((a) => a.startsWith("--runs="))?.split("=")[1] || 3);

/**
 * @param {object} baseline
 */
function toMarkdown(baseline) {
  const rows = baseline.matrix
    .map((entry) => {
      const m = entry.median;
      return `| \`${entry.lockedPath}\` | ${entry.standIn ? "stand-in" : "direct"} | \`${entry.measuredUrl}\` | ${Math.round(m.lcpMs)} | ${m.cls.toFixed(3)} | ${formatBytes(m.compressedJsBytes)} (${m.compressedJsBytes}) |`;
    })
    .join("\n");

  return `# SvelteKit production performance baseline

Captured for [[18 — Run performance cutover gate vs baseline]] comparison.
Do not re-measure production SvelteKit for cutover — compare rewrite numbers to this artifact.

| Field | Value |
| --- | --- |
| Captured at (UTC) | ${baseline.capturedAt} |
| Site | ${baseline.baseUrl} |
| Tooling | ${baseline.tooling} |
| Form factor | mobile (lab) |
| Aggregation | median of ${baseline.runsPerUrl} runs |
| Theme | ${baseline.theme} |

## Gate metrics (median)

| Locked path | Kind | Measured URL | LCP (ms) | CLS | Compressed first-load JS |
| --- | --- | --- | --- | --- | --- |
${rows}

## Notes

${baseline.matrix.map((e) => `- **${e.id}** (\`${e.lockedPath}\`): ${e.notes}`).join("\n")}

## Machine-readable

See \`docs/perf/sveltekit-production-baseline.json\`.
`;
}

async function main() {
  const matrix = sveltekitBaselineTargets(BASE);
  const sampleUrl = matrix[0]?.measuredUrl || BASE;
  const { chromePath, psiKey, tooling, mode } = resolveLabTooling(sampleUrl, { prefer: "cli" });
  process.stderr.write(`${tooling}\n`);

  /** Unique measured URLs so stand-ins sharing a document are not re-run */
  const cache = new Map();
  const matrixResults = [];

  for (const entry of matrix) {
    process.stderr.write(`Measuring ${entry.id} → ${entry.measuredUrl}\n`);
    let measured = cache.get(entry.measuredUrl);
    if (!measured) {
      measured = await measureUrl(entry.measuredUrl, {
        chromePath,
        psiKey,
        runs: RUNS,
        scratchDir,
        mode,
      });
      cache.set(entry.measuredUrl, measured);
    } else {
      process.stderr.write(`  (reusing runs for ${entry.measuredUrl})\n`);
    }
    matrixResults.push({
      ...entry,
      runs: measured.runs,
      median: measured.median,
    });
  }

  const baseline = {
    schemaVersion: 1,
    kind: "sveltekit-production-baseline",
    forTicket: "18 — Run performance cutover gate vs baseline",
    fromTicket: "01 — Capture SvelteKit production performance baseline",
    capturedAt: new Date().toISOString(),
    baseUrl: BASE,
    tooling,
    formFactor: "mobile",
    runsPerUrl: RUNS,
    aggregation: "median",
    theme: "default System→resolved (production default; measured once, no dual light/dark gate)",
    metrics: ["lcpMs", "cls", "compressedJsBytes"],
    matrix: matrixResults,
  };

  mkdirSync(outDir, { recursive: true });
  writeFileSync(outJson, JSON.stringify(baseline, null, 2) + "\n", "utf8");
  writeFileSync(outMd, toMarkdown(baseline), "utf8");
  process.stderr.write(`Wrote ${outJson}\nWrote ${outMd}\n`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
