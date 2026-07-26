/**
 * Finite deep-link route manifest for Modes, Work Folder indexes, and Work Cases.
 * Shared by build-time meta shells and client `@solidjs/meta` head sync.
 */

import { ABOUT_META, ABOUT_NAME, ABOUT_PITCH } from "../about/content";
import { WORK_FOLDERS, workCaseHref, workFolderHref, workRootHref } from "../work/inventory";
import { SITE_NAME, SITE_ORIGIN } from "./site";

export type PageMeta = {
  /** Absolute path, e.g. `/about` or `/`. */
  path: string;
  title: string;
  description: string;
  canonical: string;
};

function titleWithSite(segment: string): string {
  return `${segment} · ${SITE_NAME}`;
}

function canonicalFor(path: string): string {
  if (path === "/" || path === "") return `${SITE_ORIGIN}/`;
  return `${SITE_ORIGIN}${path}`;
}

function page(path: string, titleSegment: string, description: string): PageMeta {
  return {
    path,
    title: titleWithSite(titleSegment),
    description,
    canonical: canonicalFor(path),
  };
}

const MODE_META: PageMeta[] = [
  page("/", "About", ABOUT_PITCH),
  page("/about", "About", ABOUT_PITCH),
  page("/resume", "Resume", `PDF resume for ${ABOUT_NAME} — ${ABOUT_META}.`),
  page(
    "/contact",
    "Contact",
    `Contact ${ABOUT_NAME} — send a message, or reach out by email or LinkedIn.`,
  ),
  page(workRootHref(), "Work", "Selected work — what shipped and what it changed."),
];

function folderMeta(): PageMeta[] {
  return WORK_FOLDERS.map((folder) =>
    page(
      workFolderHref(folder.slug),
      folder.title,
      `${folder.title} — selected work and outcomes.`,
    ),
  );
}

function caseMeta(): PageMeta[] {
  const pages: PageMeta[] = [];
  for (const folder of WORK_FOLDERS) {
    for (const workCase of folder.cases) {
      pages.push(
        page(
          workCaseHref(folder.slug, workCase.slug),
          workCase.title,
          workCase.lede ?? `${workCase.title} — selected work by ${SITE_NAME}.`,
        ),
      );
    }
  }
  return pages;
}

/** Ordered deep-link set emitted as build-time HTML shells. */
export const DEEP_LINK_ROUTES: PageMeta[] = [...MODE_META, ...folderMeta(), ...caseMeta()];

const byPath = new Map(DEEP_LINK_ROUTES.map((entry) => [entry.path, entry]));

/** Home-surface title/description used when pathname is outside the finite set. */
const FALLBACK_TITLE = SITE_NAME;
const FALLBACK_DESCRIPTION = ABOUT_PITCH;

/**
 * Resolve page meta for a pathname (trailing slash normalized).
 * About `/` and the SupplyChain+ Work Case path keep distinct canonicals.
 * Unknown paths keep path + canonical honest to the request URL (SPA still mounts home).
 */
export function pageMetaForPath(pathname: string): PageMeta {
  const normalized =
    pathname.length > 1 && pathname.endsWith("/")
      ? pathname.slice(0, -1)
      : pathname === ""
        ? "/"
        : pathname;

  const exact = byPath.get(normalized);
  if (exact) return exact;

  return {
    path: normalized,
    title: FALLBACK_TITLE,
    description: FALLBACK_DESCRIPTION,
    canonical: canonicalFor(normalized),
  };
}

/** Absolute paths covered by the route manifest (for tests / build asserts). */
export function deepLinkPaths(): string[] {
  return DEEP_LINK_ROUTES.map((entry) => entry.path);
}
