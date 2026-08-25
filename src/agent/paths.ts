import { DEEP_LINK_ROUTES } from "../meta/route-manifest";
import { SITE_ORIGIN } from "../meta/site";

const STATIC_ASSET_EXT =
  /\.(?:js|mjs|cjs|css|map|png|jpe?g|webp|gif|svg|ico|woff2?|ttf|otf|eot|pdf|webmanifest|xml|txt|json)$/i;

/** Lastmod stamped into sitemap.xml (W3C date). Bump when public URLs/copy change. */
export const SITE_SITEMAP_LASTMOD = "2026-08-25";

export function normalizePathname(pathname: string): string {
  if (!pathname) return "/";
  const decoded = decodeURIComponent(pathname);
  if (decoded.length > 1 && decoded.endsWith("/")) return decoded.slice(0, -1);
  return decoded === "" ? "/" : decoded;
}

export function isBypassedAssetPath(pathname: string): boolean {
  const path = normalizePathname(pathname);
  if (path.startsWith("/api/")) return true;
  if (path.startsWith("/assets/")) return true;
  if (path.startsWith("/fonts/")) return true;
  if (path.startsWith("/work-media/")) return true;
  return STATIC_ASSET_EXT.test(path);
}

/** `/` → `/index.md`; `/about` → `/about.md`. */
export function markdownSiblingPath(pathname: string): string {
  const path = normalizePathname(pathname);
  if (path.endsWith(".md")) return path;
  if (path === "/") return "/index.md";
  return `${path}.md`;
}

export function pagePathFromMarkdownSibling(pathname: string): string | undefined {
  const path = normalizePathname(pathname);
  if (path === "/index.md") return "/";
  if (path.endsWith(".md")) {
    const page = path.slice(0, -3);
    return page.length > 0 ? page : "/";
  }
  return undefined;
}

export function markdownUrlForPath(pathname: string): string {
  const sibling = markdownSiblingPath(pathname);
  return `${SITE_ORIGIN}${sibling}`;
}

export function knownAgentPaths(): string[] {
  return DEEP_LINK_ROUTES.map((entry) => entry.path);
}

export function isKnownAgentPath(pathname: string): boolean {
  const path = normalizePathname(pathname);
  const fromMarkdown = pagePathFromMarkdownSibling(path);
  const resolved = fromMarkdown ?? path;
  return knownAgentPaths().includes(resolved);
}
