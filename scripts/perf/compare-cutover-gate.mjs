/**
 * Pure cutover-gate comparison: rewrite medians vs SvelteKit baseline.
 * Hard: LCP + compressed first-load JS — fail only if worse beyond ~10% noise.
 * Soft: CLS — fail only if clearly worse / leaves the good band (≤ 0.1).
 * Not gates: Lighthouse score, TTI, TBT, INP, field RUM.
 */

/** Fail hard metrics only when rewrite exceeds baseline × this ratio. */
export const HARD_REGRESSION_RATIO = 1.1;

/** Core Web Vitals “good” CLS band — leaving it fails the soft floor. */
export const CLS_GOOD_BAND = 0.1;

/**
 * @param {number} rewrite
 * @param {number} baseline
 * @param {number} [ratio]
 */
export function hardMetricVerdict(rewrite, baseline, ratio = HARD_REGRESSION_RATIO) {
  if (!Number.isFinite(rewrite) || !Number.isFinite(baseline) || baseline < 0) {
    throw new Error("hardMetricVerdict requires finite rewrite and non-negative baseline");
  }
  const limit = baseline * ratio;
  const worseBeyondNoise = rewrite > limit;
  return {
    rewrite,
    baseline,
    limit,
    ratio,
    delta: rewrite - baseline,
    deltaRatio: baseline === 0 ? (rewrite === 0 ? 0 : Infinity) : (rewrite - baseline) / baseline,
    pass: !worseBeyondNoise,
  };
}

/**
 * Soft CLS floor: pass while still in the good band (≤ 0.1).
 * @param {number} rewriteCls
 * @param {number} [goodBand]
 */
export function softClsVerdict(rewriteCls, goodBand = CLS_GOOD_BAND) {
  if (!Number.isFinite(rewriteCls)) {
    throw new Error("softClsVerdict requires a finite CLS value");
  }
  const leavesGoodBand = rewriteCls > goodBand;
  return {
    rewrite: rewriteCls,
    goodBand,
    leavesGoodBand,
    pass: !leavesGoodBand,
  };
}

/**
 * Reject empty/failed captures that would otherwise look like a win (0 JS, 0 LCP).
 * @param {{ lcpMs: number, cls: number, compressedJsBytes: number }} metrics
 * @param {string} label
 */
export function assertMeasurableGateMetrics(metrics, label = "metrics") {
  if (!metrics || typeof metrics !== "object") {
    throw new Error(`${label}: missing gate metrics`);
  }
  if (!(metrics.compressedJsBytes > 0)) {
    throw new Error(
      `${label}: compressed first-load JS must be > 0 (got ${metrics.compressedJsBytes}); refusing empty/failed capture`,
    );
  }
  if (!(metrics.lcpMs > 0)) {
    throw new Error(
      `${label}: LCP must be > 0 (got ${metrics.lcpMs}); refusing empty/failed capture`,
    );
  }
  if (!Number.isFinite(metrics.cls) || metrics.cls < 0) {
    throw new Error(`${label}: CLS must be a finite non-negative number`);
  }
}

/**
 * @param {{ lcpMs: number, cls: number, compressedJsBytes: number }} rewrite
 * @param {{ lcpMs: number, cls: number, compressedJsBytes: number }} baseline
 */
export function compareUrlMetrics(rewrite, baseline) {
  assertMeasurableGateMetrics(rewrite, "rewrite");
  assertMeasurableGateMetrics(baseline, "baseline");
  const lcp = hardMetricVerdict(rewrite.lcpMs, baseline.lcpMs);
  const compressedJs = hardMetricVerdict(rewrite.compressedJsBytes, baseline.compressedJsBytes);
  const cls = softClsVerdict(rewrite.cls);
  return {
    lcp,
    compressedJs,
    cls: { ...cls, baseline: baseline.cls },
    hardPass: lcp.pass && compressedJs.pass,
    softPass: cls.pass,
    pass: lcp.pass && compressedJs.pass && cls.pass,
  };
}

/**
 * @param {Array<{ id: string, lockedPath: string, median: { lcpMs: number, cls: number, compressedJsBytes: number } }>} rewriteMatrix
 * @param {Array<{ id: string, lockedPath: string, median: { lcpMs: number, cls: number, compressedJsBytes: number } }>} baselineMatrix
 */
export function compareCutoverGate(rewriteMatrix, baselineMatrix) {
  if (!Array.isArray(rewriteMatrix) || !Array.isArray(baselineMatrix)) {
    throw new Error("compareCutoverGate requires rewrite and baseline matrices");
  }
  const baselineById = new Map(baselineMatrix.map((e) => [e.id, e]));
  const rewriteById = new Map(rewriteMatrix.map((e) => [e.id, e]));

  for (const id of baselineById.keys()) {
    if (!rewriteById.has(id)) {
      throw new Error(`rewrite matrix missing baseline id "${id}"`);
    }
  }
  for (const id of rewriteById.keys()) {
    if (!baselineById.has(id)) {
      throw new Error(`baseline missing matrix id "${id}"`);
    }
  }

  const urls = [];
  for (const entry of rewriteMatrix) {
    const baselineEntry = baselineById.get(entry.id);
    if (baselineEntry.lockedPath !== entry.lockedPath) {
      throw new Error(
        `lockedPath mismatch for "${entry.id}": rewrite ${entry.lockedPath} vs baseline ${baselineEntry.lockedPath}`,
      );
    }
    const comparison = compareUrlMetrics(entry.median, baselineEntry.median);
    urls.push({
      id: entry.id,
      lockedPath: entry.lockedPath,
      rewriteMedian: entry.median,
      baselineMedian: baselineEntry.median,
      ...comparison,
    });
  }

  const hardPass = urls.every((u) => u.hardPass);
  const softPass = urls.every((u) => u.softPass);
  const pass = urls.every((u) => u.pass);

  return {
    hardRegressionRatio: HARD_REGRESSION_RATIO,
    clsGoodBand: CLS_GOOD_BAND,
    hardPass,
    softPass,
    pass,
    verdict: pass ? "pass" : "fail",
    cutoverBlocked: !pass,
    urls,
    nonGates: ["lighthousePerformanceScore", "tti", "tbt", "inp", "fieldRum", "crux"],
  };
}
