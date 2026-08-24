import type { PageMeta } from "../meta/route-manifest";
import { crawlerHtmlForPath, jsonLdScriptTag } from "./copy";
import { markdownUrlForPath } from "./paths";

const APP_MOUNT_RE = /<div id="app"><\/div>/;

/** Clip crawler HTML out of the visual shell; keep it in the raw document for no-JS extractors. */
const CRAWLER_CLIP_STYLE =
  "position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0";

export function stampAgentDocument(html: string, meta: PageMeta): string {
  let stamped = html;
  const jsonLd = jsonLdScriptTag();
  const alternate = `<link rel="alternate" type="text/markdown" href="${markdownUrlForPath(meta.path)}" />`;
  if (stamped.includes("</head>")) {
    stamped = stamped.replace("</head>", `    ${jsonLd}\n    ${alternate}\n  </head>`);
  }
  if (!APP_MOUNT_RE.test(stamped)) {
    throw new Error('stampAgentDocument: SPA template must include <div id="app"></div>');
  }
  const article = crawlerHtmlForPath(meta.path).replace(
    "<article data-crawler-content>",
    `<article data-crawler-content style="${CRAWLER_CLIP_STYLE}">`,
  );
  return stamped.replace(APP_MOUNT_RE, `<div id="app">${article}</div>`);
}
