import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  compressedFirstLoadJsBytes,
  extractGateMetrics,
  median,
  medianGateMetrics,
} from "./extract-lighthouse-metrics.mjs";

describe("median", () => {
  it("returns middle value for odd length", () => {
    assert.equal(median([3, 1, 2]), 2);
  });

  it("averages middle pair for even length", () => {
    assert.equal(median([4, 1, 2, 3]), 2.5);
  });
});

describe("extractGateMetrics", () => {
  it("reads LCP, CLS, and compressed script transfer from network-requests", () => {
    const lhr = {
      audits: {
        "largest-contentful-paint": { numericValue: 2100 },
        "cumulative-layout-shift": { numericValue: 0.04 },
        "network-requests": {
          details: {
            items: [
              {
                url: "https://vishalk.com/_app/immutable/entry/app.js",
                resourceType: "Script",
                mimeType: "application/javascript",
                transferSize: 40_000,
              },
              {
                url: "https://vishalk.com/_app/immutable/assets/0.css",
                resourceType: "Stylesheet",
                mimeType: "text/css",
                transferSize: 10_000,
              },
              {
                url: "https://vishalk.com/_app/immutable/chunks/x.js",
                resourceType: "Script",
                mimeType: "application/javascript",
                transferSize: 12_500,
              },
            ],
          },
        },
      },
    };

    assert.deepEqual(extractGateMetrics(lhr), {
      lcpMs: 2100,
      cls: 0.04,
      compressedJsBytes: 52_500,
    });
  });

  it("falls back to resource-summary for script transfer", () => {
    const lhr = {
      audits: {
        "largest-contentful-paint": { numericValue: 1000 },
        "cumulative-layout-shift": { numericValue: 0 },
        "resource-summary": {
          details: {
            items: [{ resourceType: "script", transferSize: 99_000 }],
          },
        },
      },
    };
    assert.equal(compressedFirstLoadJsBytes(lhr), 99_000);
  });
});

describe("medianGateMetrics", () => {
  it("medians each gate metric across runs", () => {
    assert.deepEqual(
      medianGateMetrics([
        { lcpMs: 1000, cls: 0.01, compressedJsBytes: 10 },
        { lcpMs: 3000, cls: 0.05, compressedJsBytes: 30 },
        { lcpMs: 2000, cls: 0.03, compressedJsBytes: 20 },
      ]),
      { lcpMs: 2000, cls: 0.03, compressedJsBytes: 20, runCount: 3 },
    );
  });
});
