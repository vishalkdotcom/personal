/**
 * Resolve locked Work Case carousel assets (Vite URL strings).
 * Path→slide inventory SoT:
 * `.scratch/solidjs-portfolio-redesign/research/2026-07-25-work-media-asset-inventory.md`
 *
 * Keep this module off the meta / route-manifest import path — image imports must not
 * enter the Vite config bundle (emit-meta-shells → route-manifest → inventory).
 *
 * Glob is narrowed to committed WebP derivatives for storefront/LS work assets +
 * AAP `aai-*` only — legacy project PNGs stay out of the client graph. Prefer
 * committed sharp output over vite-imagetools.
 */

/** Locked responsive widths for stage / viewer `srcset` (one-time sharp output). */
export const WORK_MEDIA_WIDTHS = [800, 1600, 2400] as const;

export type WorkMediaWidth = (typeof WORK_MEDIA_WIDTHS)[number];

/**
 * Carousel `sizes`: mobile stage content ≈ 100vw − 32px padding; desktop Triptych
 * stage column lands near the Spec’s ~640–680px measure (~668px at 1280 Triptych).
 */
export const WORK_MEDIA_CAROUSEL_SIZES = "(max-width: 767px) calc(100vw - 32px), 680px";

/** Fullscreen viewer fills the viewport. */
export const WORK_MEDIA_VIEWER_SIZES = "100vw";

export type WorkMediaDerivative = {
  width: WorkMediaWidth;
  /** Path relative to `src/images/` (e.g. `work/supplychain-plus/home-800w.webp`). */
  inventoryPath: string;
};

export type ResolvedWorkMedia = {
  /** Fallback URL (prefer 800w). */
  src: string;
  /** Responsive `srcset` descriptor list. */
  srcSet: string;
};

const webpUrls = {
  ...import.meta.glob<string>("../images/work/**/*-[0-9]*w.webp", {
    eager: true,
    query: "?url",
    import: "default",
  }),
  ...import.meta.glob<string>("../images/projects/aai-*-*w.webp", {
    eager: true,
    query: "?url",
    import: "default",
  }),
};

/** Inventory PNG `src` → committed WebP derivative relatives under `src/images/`. */
export function workMediaDerivativeRelPaths(inventorySrc: string): WorkMediaDerivative[] {
  const normalized = inventorySrc.replace(/^\//, "");
  if (!normalized.toLowerCase().endsWith(".png")) {
    throw new Error(`Work Case media inventory src must be a .png path, got "${inventorySrc}"`);
  }
  const withoutExt = normalized.slice(0, -".png".length);
  return WORK_MEDIA_WIDTHS.map((width) => ({
    width,
    inventoryPath: `${withoutExt}-${width}w.webp`,
  }));
}

function urlForInventoryPath(inventoryPath: string): string | undefined {
  return webpUrls[`../images/${inventoryPath}`];
}

/** Resolve inventory PNG `src` to committed WebP `src` + `srcSet`. */
export function tryResolveWorkMedia(inventorySrc: string): ResolvedWorkMedia | undefined {
  const entries: { width: WorkMediaWidth; url: string }[] = [];
  for (const derivative of workMediaDerivativeRelPaths(inventorySrc)) {
    const url = urlForInventoryPath(derivative.inventoryPath);
    if (!url) return undefined;
    entries.push({ width: derivative.width, url });
  }
  const fallback = entries.find((entry) => entry.width === 800) ?? entries[0]!;
  return {
    src: fallback.url,
    srcSet: entries.map((entry) => `${entry.url} ${entry.width}w`).join(", "),
  };
}

export function resolveWorkMedia(inventorySrc: string): ResolvedWorkMedia {
  const resolved = tryResolveWorkMedia(inventorySrc);
  if (!resolved) {
    throw new Error(
      `Missing Work Case media WebP derivatives for "${inventorySrc}" (expected *-800w/1600w/2400w.webp)`,
    );
  }
  return resolved;
}

/** Inventory `src` is relative to `src/images/` (e.g. `work/supplychain-plus/home.png`). */
export function resolveWorkMediaSrc(inventorySrc: string): string {
  const url = tryResolveWorkMediaSrc(inventorySrc);
  if (!url) {
    throw new Error(
      `Missing Work Case media asset for "${inventorySrc}" (WebP derivatives under src/images/)`,
    );
  }
  return url;
}

/** Same lookup as `resolveWorkMediaSrc`, but returns `undefined` when the asset is absent. */
export function tryResolveWorkMediaSrc(inventorySrc: string): string | undefined {
  return tryResolveWorkMedia(inventorySrc)?.src;
}
