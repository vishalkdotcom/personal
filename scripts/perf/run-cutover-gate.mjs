/**
 * Measure the SolidJS 2 rewrite on the locked URL matrix and compare to the
 * checked-in SvelteKit production baseline (do not re-measure prod SvelteKit).
 *
 * Usage:
 *   bun run build && node scripts/perf/run-cutover-gate.mjs
 *   node scripts/perf/run-cutover-gate.mjs --runs=5
 *   PERF_BASE_URL=https://preview.example node scripts/perf/run-cutover-gate.mjs
 *
 * Without PERF_BASE_URL, serves dist/ locally with gzip + Pages pretty URLs.
 * Playwright+Lighthouse is the default lab runner (Windows chrome-launcher hang
 * workaround); metrics still come from Lighthouse LHR. Prefer a deploy preview
 * URL for a host closer to production when claiming LCP cutover clearance.
 */

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { compareCutoverGate } from "./compare-cutover-gate.mjs";
import { startGzipStaticServer } from "./gzip-static-server.mjs";
import { formatBytes, rewriteCutoverTargets } from "./locked-matrix.mjs";
import { measureUrl, resolveLabTooling } from "./lighthouse-lab.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "../..");
const outDir = join(repoRoot, "docs/perf");
const baselineJson = join(outDir, "sveltekit-production-baseline.json");
const outJson = join(outDir, "solidjs-cutover-gate.json");
const outMd = join(outDir, "solidjs-cutover-gate.md");
const distDir = join(repoRoot, "dist");
const scratchDir = join(repoRoot, ".tmp/lighthouse-cutover");

const RUNS = Number(process.argv.find((a) => a.startsWith("--runs="))?.split("=")[1] || 3);
const SKIP_BUILD = process.argv.includes("--skip-build");

function formatPct(ratio) {
  if (!Number.isFinite(ratio)) return "n/a";
  const pct = ratio * 100;
  const sign = pct > 0 ? "+" : "";
  return `${sign}${pct.toFixed(1)}%`;
}

function ensureDist() {
  if (SKIP_BUILD && existsSync(join(distDir, "index.html"))) return;
  if (SKIP_BUILD) {
    throw new Error("dist/index.html missing; run bun run build or omit --skip-build");
  }
  process.stderr.write("Building production bundle…\n");
  const result = spawnSync("bun", ["run", "build"], {
    cwd: repoRoot,
    encoding: "utf8",
    shell: true,
  });
  if (result.status !== 0) {
    throw new Error(`bun run build failed:\n${result.stderr || result.stdout}`);
  }
}

/**
 * @param {object} report
 */
function toMarkdown(report) {
  const gate = report.comparison;
  const rows = gate.urls
    .map((u) => {
      const hard = u.hardPass ? "pass" : "FAIL";
      const soft = u.softPass ? "pass" : "FAIL";
      return `| \`${u.lockedPath}\` | ${Math.round(u.rewriteMedian.lcpMs)} / ${Math.round(u.baselineMedian.lcpMs)} (${formatPct(u.lcp.deltaRatio)}) | ${u.rewriteMedian.cls.toFixed(3)} / ${u.baselineMedian.cls.toFixed(3)} | ${formatBytes(u.rewriteMedian.compressedJsBytes)} / ${formatBytes(u.baselineMedian.compressedJsBytes)} (${formatPct(u.compressedJs.deltaRatio)}) | hard ${hard}; CLS soft ${soft} |`;
    })
    .join("\n");

  const overall = gate.pass ? "PASS" : "FAIL";
  const cutover = gate.cutoverBlocked
    ? "Cutover stays **blocked**. Follow-on fix loop may open (code-split / media / PDF). Solid vs Svelte stack is **not** reopened."
    : "Cutover gate **cleared** on lab metrics (LCP, compressed first-load JS, CLS soft floor).";

  const envNote =
    report.environmentClass === "local-lab"
      ? "Rewrite measured on **local-lab** (`dist/` over loopback with gzip). Baseline is production SvelteKit. Lighthouse applies lab mobile simulation on both; local TTFB is near-zero, so treat LCP as lab-comparative under that caveat. Compressed first-load JS remains the primary transfer apples-to-apples check. Set `PERF_BASE_URL` to a rewrite deploy preview for a closer host match."
      : "Rewrite measured on a remote base URL (deploy preview / hosted).";

  return `# SolidJS 2 performance cutover gate

Measured for ticket **18 — Run performance cutover gate vs baseline**.
Compared against checked-in \`docs/perf/sveltekit-production-baseline.json\` — production SvelteKit was **not** re-measured.

| Field | Value |
| --- | --- |
| Overall verdict | **${overall}** |
| Cutover blocked | ${gate.cutoverBlocked ? "yes" : "no"} |
| Environment class | ${report.environmentClass} |
| Captured at (UTC) | ${report.capturedAt} |
| Rewrite base URL | ${report.baseUrl} |
| Baseline artifact | ${report.baseline.capturedAt} @ ${report.baseline.baseUrl} |
| Tooling | ${report.tooling} |
| Form factor | mobile (lab) |
| Aggregation | median of ${report.runsPerUrl} runs |
| Hard noise band | fail only if worse than baseline by more than ~${((gate.hardRegressionRatio - 1) * 100).toFixed(0)}% |
| CLS soft floor | fail only if CLS > ${gate.clsGoodBand} (leaves good band) |
| Theme | ${report.theme} |

## Environment note

${envNote}

## Per-URL gate metrics (rewrite / baseline)

| Locked path | LCP (ms) | CLS | Compressed first-load JS | Verdict |
| --- | --- | --- | --- | --- |
${rows}

## Non-gates (recorded policy — not evaluated)

${gate.nonGates.map((g) => `- ${g}`).join("\n")}

## Cutover decision

${cutover}

## Notes

${report.matrix.map((e) => `- **${e.id}** (\`${e.lockedPath}\`): ${e.notes}`).join("\n")}

## Machine-readable

See \`docs/perf/solidjs-cutover-gate.json\`.
`;
}

async function main() {
  if (!existsSync(baselineJson)) {
    throw new Error(`Missing baseline artifact: ${baselineJson}`);
  }
  const baseline = JSON.parse(readFileSync(baselineJson, "utf8"));

  let baseUrl = process.env.PERF_BASE_URL || "";
  /** @type {null | { close: () => Promise<void> }} */
  let localServer = null;
  /** @type {"local-lab" | "remote"} */
  let environmentClass = "remote";

  if (!baseUrl) {
    ensureDist();
    const port = Number(process.env.PERF_PORT || 0);
    localServer = await startGzipStaticServer(distDir, {
      host: "127.0.0.1",
      port: Number.isFinite(port) ? port : 0,
    });
    baseUrl = localServer.baseUrl;
    environmentClass = "local-lab";
    process.stderr.write(`Serving dist/ with gzip pretty URLs at ${baseUrl}\n`);
  } else {
    process.stderr.write(`Using PERF_BASE_URL=${baseUrl}\n`);
  }

  const targets = rewriteCutoverTargets(baseUrl);
  const { chromePath, psiKey, tooling, mode } = resolveLabTooling(targets[0].measuredUrl, {
    prefer: "playwright",
  });
  process.stderr.write(`${tooling}\n`);

  try {
    const matrixResults = [];
    for (const entry of targets) {
      process.stderr.write(`Measuring ${entry.id} → ${entry.measuredUrl}\n`);
      const measured = await measureUrl(entry.measuredUrl, {
        chromePath,
        psiKey,
        runs: RUNS,
        scratchDir,
        mode,
      });
      matrixResults.push({
        ...entry,
        runs: measured.runs,
        median: measured.median,
      });
    }

    const comparison = compareCutoverGate(matrixResults, baseline.matrix);

    const report = {
      schemaVersion: 1,
      kind: "solidjs-cutover-gate",
      forTicket: "18 — Run performance cutover gate vs baseline",
      baselineArtifact: "docs/perf/sveltekit-production-baseline.json",
      baseline: {
        kind: baseline.kind,
        capturedAt: baseline.capturedAt,
        baseUrl: baseline.baseUrl,
        fromTicket: baseline.fromTicket,
      },
      capturedAt: new Date().toISOString(),
      baseUrl,
      environmentClass,
      tooling,
      formFactor: "mobile",
      runsPerUrl: RUNS,
      aggregation: "median",
      theme: "default System→resolved (measured once, no dual light/dark gate)",
      metrics: ["lcpMs", "cls", "compressedJsBytes"],
      matrix: matrixResults,
      comparison,
    };

    mkdirSync(outDir, { recursive: true });
    writeFileSync(outJson, JSON.stringify(report, null, 2) + "\n", "utf8");
    writeFileSync(outMd, toMarkdown(report), "utf8");
    process.stderr.write(`Wrote ${outJson}\nWrote ${outMd}\n`);
    process.stderr.write(
      `Verdict: ${comparison.verdict.toUpperCase()} (cutoverBlocked=${comparison.cutoverBlocked})\n`,
    );

    // Measurement + write-up is the ticket deliverable; a fail still exits 0 so
    // the artifact can be committed. Use --strict to exit 1 on gate fail.
    if (process.argv.includes("--strict") && !comparison.pass) {
      process.exit(1);
    }
  } finally {
    if (localServer) await localServer.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
