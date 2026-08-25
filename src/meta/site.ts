/** Public site origin for canonical + OG URLs. */
export const SITE_ORIGIN = "https://vishalk.com";

/** Apex host — unique site brand (the person name collides in search). */
export const SITE_HOST = new URL(SITE_ORIGIN).host;

export const SITE_NAME = "Vishal Kumar";

/** Google site-name fallbacks: lowercase domain first, then the short handle. */
export const SITE_ALTERNATE_NAMES = ["vishalk.com", "vishalk"] as const;

/** Homepage / OG title: person name plus unique host so brand search can find the domain. */
export const HOME_TITLE = `${SITE_NAME} · ${SITE_HOST}`;

export const DEFAULT_OG_TYPE = "website";

/** Absolute OG image for link previews (copied from `static/` into `dist/`). */
export const OG_IMAGE_URL = `${SITE_ORIGIN}/og.png`;

export const LINKEDIN_PROFILE_HREF = "https://www.linkedin.com/in/vishalkdotcom";
export const GITHUB_PROFILE_HREF = "https://github.com/vishalkdotcom";

export const IDENTITY_PROFILE_HREFS = [LINKEDIN_PROFILE_HREF, GITHUB_PROFILE_HREF] as const;
