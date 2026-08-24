import type { PageMeta } from "./route-manifest";
import { headTagsFor, type HeadTag } from "./head-tags";
import { escapeHtmlAttr, escapeHtmlText } from "./html-escape";

export { escapeHtmlAttr, escapeHtmlText } from "./html-escape";
export { shellOutputPath } from "./shell-paths";

export const META_MARKER_START = "<!-- app-shell-meta -->";
export const META_MARKER_END = "<!-- /app-shell-meta -->";
export const JSONLD_MARKER_START = "<!-- app-shell-jsonld -->";
export const JSONLD_MARKER_END = "<!-- /app-shell-jsonld -->";
export const SNAPSHOT_MARKER_START = "<!-- app-shell-snapshot -->";
export const SNAPSHOT_MARKER_END = "<!-- /app-shell-snapshot -->";

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
    case "link": {
      const typeAttr = tag.type ? ` type="${escapeHtmlAttr(tag.type)}"` : "";
      return `<link data-sm="${tag.dataSm}" rel="${escapeHtmlAttr(tag.rel)}" href="${escapeHtmlAttr(tag.href)}"${typeAttr} />`;
    }
  }
}

/**
 * Stamp title / description / OG / canonical into an SPA HTML shell.
 * Tags use `data-sm` so `@solidjs/meta` MetaProvider clears them on client boot
 * and owns head updates for in-app navigation (same path as SSR tag handoff).
 *
 * Emits Cloudflare Pages extension shells (`resume.html`) so slash-free deep links
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
  if (!titleRe.test(templateHtml)) {
    throw new Error("stampMetaShell: SPA template must include a <title> to replace");
  }
  return templateHtml.replace(titleRe, block);
}

function replaceOrInsert(
  html: string,
  start: string,
  end: string,
  block: string,
  insertBefore: RegExp,
  missingMessage: string,
): string {
  const marked = new RegExp(`${start}[\\s\\S]*?${end}`, "m");
  if (marked.test(html)) return html.replace(marked, block);
  if (!insertBefore.test(html)) {
    throw new Error(missingMessage);
  }
  return html.replace(insertBefore, `${block}\n    $&`);
}

/** Stamp JSON-LD (no `data-sm`) so cold-load crawlers see identity without JS. */
export function stampJsonLd(html: string, scriptContent: string): string {
  const block = `${JSONLD_MARKER_START}\n    <script type="application/ld+json">${scriptContent}</script>\n    ${JSONLD_MARKER_END}`;
  return replaceOrInsert(
    html,
    JSONLD_MARKER_START,
    JSONLD_MARKER_END,
    block,
    /<\/head>/i,
    "stampJsonLd: SPA template must include </head>",
  );
}

/** Stamp crawlable article HTML inside `#app` for no-JS / AI crawlers. */
export function stampSnapshot(html: string, snapshotHtml: string): string {
  const block = `${SNAPSHOT_MARKER_START}\n    ${snapshotHtml}\n    ${SNAPSHOT_MARKER_END}`;
  const marked = new RegExp(`${SNAPSHOT_MARKER_START}[\\s\\S]*?${SNAPSHOT_MARKER_END}`, "m");
  if (marked.test(html)) return html.replace(marked, block);
  const appRe = /<div id="app">\s*<\/div>/i;
  if (!appRe.test(html)) {
    throw new Error('stampSnapshot: SPA template must include <div id="app"></div>');
  }
  return html.replace(appRe, `<div id="app">${block}</div>`);
}
