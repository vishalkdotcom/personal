/**
 * Pure helpers: Lighthouse JSON → cutover-gate metrics.
 * Used by capture-sveltekit-baseline.mjs and ticket 18 comparison.
 */

/** @param {number[]} values */
export function median(values) {
  if (!Array.isArray(values) || values.length === 0) {
    throw new Error("median requires a non-empty array");
  }
  const sorted = [...values]
    .filter((v) => typeof v === "number" && Number.isFinite(v))
    .sort((a, b) => a - b);
  if (sorted.length === 0) {
    throw new Error("median requires at least one finite number");
  }
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

/**
 * Sum compressed transfer size for first-load script resources.
 * Prefers network-requests audit; falls back to script-treemap-data / resource-summary.
 * @param {object} lhr Lighthouse result object
 * @returns {number} bytes
 */
export function compressedFirstLoadJsBytes(lhr) {
  const network = lhr?.audits?.["network-requests"]?.details?.items;
  if (Array.isArray(network) && network.length > 0) {
    let total = 0;
    for (const item of network) {
      const mime = String(item.mimeType || item.resourceType || "");
      const url = String(item.url || "");
      const isScript =
        item.resourceType === "Script" ||
        mime.includes("javascript") ||
        mime.includes("ecmascript") ||
        /\.m?js(\?|$)/i.test(url);
      if (!isScript) continue;
      const transfer =
        typeof item.transferSize === "number"
          ? item.transferSize
          : typeof item.networkEndTime === "number" && typeof item.resourceSize === "number"
            ? item.resourceSize
            : 0;
      if (transfer > 0) total += transfer;
    }
    if (total > 0) return total;
  }

  const summary = lhr?.audits?.["resource-summary"]?.details?.items;
  if (Array.isArray(summary)) {
    const scripts = summary.find((i) => i.resourceType === "script");
    if (scripts && typeof scripts.transferSize === "number") {
      return scripts.transferSize;
    }
  }

  return 0;
}

/**
 * @param {object} lhr Lighthouse result object
 * @returns {{ lcpMs: number, cls: number, compressedJsBytes: number }}
 */
export function extractGateMetrics(lhr) {
  const lcp = lhr?.audits?.["largest-contentful-paint"]?.numericValue;
  const cls = lhr?.audits?.["cumulative-layout-shift"]?.numericValue;
  if (typeof lcp !== "number" || !Number.isFinite(lcp)) {
    throw new Error("missing LCP numericValue in Lighthouse result");
  }
  if (typeof cls !== "number" || !Number.isFinite(cls)) {
    throw new Error("missing CLS numericValue in Lighthouse result");
  }
  return {
    lcpMs: lcp,
    cls,
    compressedJsBytes: compressedFirstLoadJsBytes(lhr),
  };
}

/**
 * @param {Array<{ lcpMs: number, cls: number, compressedJsBytes: number }>} runs
 */
export function medianGateMetrics(runs) {
  if (!Array.isArray(runs) || runs.length === 0) {
    throw new Error("medianGateMetrics requires a non-empty runs array");
  }
  return {
    lcpMs: median(runs.map((r) => r.lcpMs)),
    cls: median(runs.map((r) => r.cls)),
    compressedJsBytes: median(runs.map((r) => r.compressedJsBytes)),
    runCount: runs.length,
  };
}
