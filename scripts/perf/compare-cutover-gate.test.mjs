import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  CLS_GOOD_BAND,
  HARD_REGRESSION_RATIO,
  assertMeasurableGateMetrics,
  compareCutoverGate,
  compareUrlMetrics,
  hardMetricVerdict,
  softClsVerdict,
} from "./compare-cutover-gate.mjs";

describe("hardMetricVerdict", () => {
  it("passes when rewrite matches baseline", () => {
    const v = hardMetricVerdict(1000, 1000);
    assert.equal(v.pass, true);
    assert.equal(v.limit, 1100);
  });

  it("passes when rewrite is better than baseline", () => {
    assert.equal(hardMetricVerdict(900, 1000).pass, true);
  });

  it("passes at the ~10% noise ceiling", () => {
    assert.equal(hardMetricVerdict(1100, 1000).pass, true);
  });

  it("fails only when worse beyond ~10% noise", () => {
    assert.equal(hardMetricVerdict(1100.1, 1000).pass, false);
  });

  it("uses the exported regression ratio", () => {
    assert.equal(HARD_REGRESSION_RATIO, 1.1);
  });
});

describe("softClsVerdict", () => {
  it("passes inside the good band", () => {
    const v = softClsVerdict(0.05);
    assert.equal(v.pass, true);
    assert.equal(v.leavesGoodBand, false);
  });

  it("fails when CLS leaves the good band", () => {
    const v = softClsVerdict(0.11);
    assert.equal(v.pass, false);
    assert.equal(v.leavesGoodBand, true);
  });

  it("uses CWV good-band constant 0.1", () => {
    assert.equal(CLS_GOOD_BAND, 0.1);
  });
});

describe("assertMeasurableGateMetrics", () => {
  it("rejects zero compressed JS (empty capture must not look like a win)", () => {
    assert.throws(
      () => assertMeasurableGateMetrics({ lcpMs: 100, cls: 0, compressedJsBytes: 0 }),
      /compressed first-load JS must be > 0/,
    );
  });

  it("rejects zero LCP", () => {
    assert.throws(
      () => assertMeasurableGateMetrics({ lcpMs: 0, cls: 0, compressedJsBytes: 10 }),
      /LCP must be > 0/,
    );
  });
});

describe("compareUrlMetrics", () => {
  it("requires hard LCP/JS and soft CLS all to pass", () => {
    const ok = compareUrlMetrics(
      { lcpMs: 3500, cls: 0.01, compressedJsBytes: 80_000 },
      { lcpMs: 3534, cls: 0, compressedJsBytes: 88_208 },
    );
    assert.equal(ok.pass, true);
    assert.equal(ok.hardPass, true);
    assert.equal(ok.softPass, true);
  });

  it("fails hard when JS exceeds baseline by more than 10%", () => {
    const bad = compareUrlMetrics(
      { lcpMs: 3000, cls: 0, compressedJsBytes: 100_000 },
      { lcpMs: 3534, cls: 0, compressedJsBytes: 88_208 },
    );
    assert.equal(bad.hardPass, false);
    assert.equal(bad.compressedJs.pass, false);
    assert.equal(bad.pass, false);
  });
});

const fullBaseline = [
  {
    id: "home",
    lockedPath: "/",
    median: { lcpMs: 3534, cls: 0, compressedJsBytes: 88_208 },
  },
  {
    id: "internal-dossier",
    lockedPath: "/work/labor-solutions/engage-reporting",
    median: { lcpMs: 3534, cls: 0, compressedJsBytes: 88_208 },
  },
  {
    id: "resume",
    lockedPath: "/resume",
    median: { lcpMs: 3534, cls: 0, compressedJsBytes: 88_208 },
  },
  {
    id: "contact",
    lockedPath: "/contact",
    median: { lcpMs: 3826, cls: 0, compressedJsBytes: 70_424 },
  },
];

describe("compareCutoverGate", () => {
  it("aggregates per-URL verdicts and marks cutover blocked on fail", () => {
    const rewrite = fullBaseline.map((e) => ({
      ...e,
      median: {
        ...e.median,
        lcpMs: e.id === "contact" ? 5000 : 3000,
        compressedJsBytes: 50_000,
      },
    }));
    const result = compareCutoverGate(rewrite, fullBaseline);

    assert.equal(result.urls.length, 4);
    assert.equal(result.urls.find((u) => u.id === "home")?.pass, true);
    assert.equal(result.urls.find((u) => u.id === "contact")?.lcp.pass, false);
    assert.equal(result.pass, false);
    assert.equal(result.verdict, "fail");
    assert.equal(result.cutoverBlocked, true);
    assert.ok(result.nonGates.includes("tti"));
    assert.ok(result.nonGates.includes("fieldRum"));
  });

  it("rejects incomplete rewrite matrix", () => {
    assert.throws(
      () =>
        compareCutoverGate(
          [
            {
              id: "home",
              lockedPath: "/",
              median: { lcpMs: 3000, cls: 0, compressedJsBytes: 50_000 },
            },
          ],
          fullBaseline,
        ),
      /rewrite matrix missing baseline id/,
    );
  });

  it("rejects lockedPath mismatch", () => {
    const rewrite = fullBaseline.map((e) =>
      e.id === "home"
        ? {
            ...e,
            lockedPath: "/wrong",
            median: { lcpMs: 3000, cls: 0, compressedJsBytes: 50_000 },
          }
        : { ...e, median: { lcpMs: 3000, cls: 0, compressedJsBytes: 50_000 } },
    );
    assert.throws(() => compareCutoverGate(rewrite, fullBaseline), /lockedPath mismatch/);
  });
});
