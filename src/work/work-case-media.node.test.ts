import { existsSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  WORK_MEDIA_CAROUSEL_SIZES,
  WORK_MEDIA_VIEWER_SIZES,
  WORK_MEDIA_WIDTHS,
  workMediaDerivativeRelPaths,
} from "./work-case-media";

describe("work-case-media responsive derivatives (work-case media seam)", () => {
  it("maps inventory PNG paths to committed 800/1600/2400w WebP relatives", () => {
    expect(WORK_MEDIA_WIDTHS).toEqual([800, 1600, 2400]);
    expect(workMediaDerivativeRelPaths("work/supplychain-plus/home.png")).toEqual([
      { width: 800, inventoryPath: "work/supplychain-plus/home-800w.webp" },
      { width: 1600, inventoryPath: "work/supplychain-plus/home-1600w.webp" },
      { width: 2400, inventoryPath: "work/supplychain-plus/home-2400w.webp" },
    ]);
    expect(workMediaDerivativeRelPaths("projects/aai-mfdb-1.png")).toEqual([
      { width: 800, inventoryPath: "projects/aai-mfdb-1-800w.webp" },
      { width: 1600, inventoryPath: "projects/aai-mfdb-1-1600w.webp" },
      { width: 2400, inventoryPath: "projects/aai-mfdb-1-2400w.webp" },
    ]);
  });

  it("locks carousel sizes for mobile stage padding and desktop Triptych measure", () => {
    expect(WORK_MEDIA_CAROUSEL_SIZES).toBe("(max-width: 767px) calc(100vw - 32px), 680px");
    expect(WORK_MEDIA_VIEWER_SIZES).toBe("100vw");
  });

  it("has committed WebP derivatives on disk for a typical Public Storefront case", () => {
    const imagesRoot = resolve(process.cwd(), "src/images");
    for (const { inventoryPath } of workMediaDerivativeRelPaths("work/supplychain-plus/home.png")) {
      const absolute = resolve(imagesRoot, inventoryPath);
      expect(existsSync(absolute), absolute).toBe(true);
      expect(statSync(absolute).size).toBeGreaterThan(0);
    }
  });

  it("keeps a typical case first-slide 800w WebP in the ~500 KB initial media ballpark", () => {
    const absolute = resolve(process.cwd(), "src/images/work/supplychain-plus/home-800w.webp");
    expect(existsSync(absolute), absolute).toBe(true);
    const bytes = statSync(absolute).size;
    // Spot-check: active slide alone should be well under the Spec’s ~500 KB initial budget.
    expect(bytes).toBeLessThan(500 * 1024);
    expect(bytes).toBeGreaterThan(5 * 1024);
  });
});
