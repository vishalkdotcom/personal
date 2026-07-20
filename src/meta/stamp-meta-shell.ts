import type { PageMeta } from "./route-manifest";
import { headTagsFor, type HeadTag } from "./head-tags";

/** Escape text for use inside an HTML attribute value (double-quoted). */
export function escapeHtmlAttr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** Escape text for use as HTML text content (e.g. `<title>`). */
export function escapeHtmlText(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

const META_MARKER_START = "<!-- app-shell-meta -->";
const META_MARKER_END = "<!-- /app-shell-meta -->";

function renderTag(tag: HeadTag): string {
  switch (tag.kind) {
    case "title":
      return `<title data-sm="${tag.dataSm}">${escapeHtmlText(tag.text)}</title>`;
    case "meta": {
      const key = tag.name
        ? `name="${escapeHtmlAttr(tag.name)}"`
        : `property="${escapeHtmlAttr(tag.property ?? "")}"`;
      return `<meta data-sm="${tag.dataSm}" ${key} content="${escapeHtmlAttr(tag.content)}" />`;
    }
    case "link":
      return `<link data-sm="${tag.dataSm}" rel="${escapeHtmlAttr(tag.rel)}" href="${escapeHtmlAttr(tag.href)}" />`;
  }
}

/**
 * Stamp title / description / OG / canonical into an SPA HTML shell.
 * Tags use `data-sm` so `@solidjs/meta` MetaProvider clears them on client boot
 * and owns head updates for in-app navigation (same path as SSR tag handoff).
 *
 * Emits Cloudflare Pages extension shells (`about.html`) so slash-free deep links
 * stay aligned with canonicals (directory index HTML would 308 to a trailing slash).
 */
export function stampMetaShell(templateHtml: string, meta: PageMeta): string {
  const block = [META_MARKER_START, ...headTagsFor(meta).map(renderTag), META_MARKER_END].join(
    "\n    ",
  );

  const marked = new RegExp(`${META_MARKER_START}[\\s\\S]*?${META_MARKER_END}`, "m");
  if (marked.test(templateHtml)) {
    return templateHtml.replace(marked, block);
  }

  const titleRe = /<title\b[^>]*>[^<]*<\/title>/i;
  if (titleRe.test(templateHtml)) {
    return templateHtml.replace(titleRe, block);
  }

  return templateHtml.replace(/<\/head>/i, `    ${block}\n  </head>`);
}

/**
 * Dist-relative shell path for Cloudflare Pages pretty URLs.
 * `/about` → `about.html` (not `about/index.html`).
 */
export function shellOutputPath(path: string): string {
  if (path === "/" || path === "") return "index.html";
  const trimmed = path.startsWith("/") ? path.slice(1) : path;
  return `${trimmed}.html`;
}
