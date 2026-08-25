/** Public site origin for canonical + OG URLs. */
export const SITE_ORIGIN = "https://vishalk.com";

export const SITE_NAME = "Vishal Kumar";

/** Google site-name fallbacks: lowercase domain first, then the short handle. */
export const SITE_ALTERNATE_NAMES = ["vishalk.com", "vishalk"] as const;

export const DEFAULT_OG_TYPE = "website";

/** Absolute OG image for link previews (copied from `static/` into `dist/`). */
export const OG_IMAGE_URL = `${SITE_ORIGIN}/og.png`;
