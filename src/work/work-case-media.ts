/**
 * Resolve locked Work Case carousel assets (Vite URL strings).
 * Path→slide inventory SoT:
 * `.scratch/solidjs-portfolio-redesign/research/2026-07-25-work-media-asset-inventory.md`
 *
 * Keep this module off the meta / route-manifest import path — PNG imports must not
 * enter the Vite config bundle (emit-meta-shells → route-manifest → inventory).
 *
 * Glob is narrowed to storefront/LS work assets + AAP `aai-*` only — legacy project
 * PNGs stay out of the client graph.
 */

const pngUrls = {
  ...import.meta.glob<string>("../images/work/**/*.png", {
    eager: true,
    query: "?url",
    import: "default",
  }),
  ...import.meta.glob<string>("../images/projects/aai-*.png", {
    eager: true,
    query: "?url",
    import: "default",
  }),
};

/** Inventory `src` is relative to `src/images/` (e.g. `work/supplychain-plus/home.png`). */
export function resolveWorkMediaSrc(inventorySrc: string): string {
  const key = `../images/${inventorySrc.replace(/^\//, "")}`;
  const url = pngUrls[key];
  if (!url) {
    throw new Error(`Missing Work Case media asset for "${inventorySrc}" (glob key ${key})`);
  }
  return url;
}
