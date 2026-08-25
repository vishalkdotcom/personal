import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { llmsTxt, markdownForPath, notFoundHtmlDocument, sitemapXml } from "../agent/copy";
import { markdownSiblingPath, SITE_SITEMAP_LASTMOD } from "../agent/paths";
import { stampAgentDocument } from "../agent/stamp-document";
import { DEEP_LINK_ROUTES } from "./route-manifest";
import { shellOutputPath, stampMetaShell } from "./stamp-meta-shell";

const HEADERS_SOURCE = fileURLToPath(new URL("../../static/_headers", import.meta.url));

function markdownOutputPath(path: string): string {
  const sibling = markdownSiblingPath(path);
  return sibling.startsWith("/") ? sibling.slice(1) : sibling;
}

/**
 * After Vite writes `dist/index.html`, stamp per-path meta shells, crawler HTML,
 * markdown siblings, 404.html, sitemap.xml, and llms.txt.
 */
export function emitMetaShells(outDir: string): void {
  const templatePath = join(outDir, "index.html");
  const template = readFileSync(templatePath, "utf8");

  for (const route of DEEP_LINK_ROUTES) {
    const relative = shellOutputPath(route.path);
    const absolute = join(outDir, relative);
    mkdirSync(dirname(absolute), { recursive: true });
    const html = stampAgentDocument(stampMetaShell(template, route), route);
    writeFileSync(absolute, html, "utf8");

    const markdown = markdownForPath(route.path);
    if (markdown) {
      const mdRelative = markdownOutputPath(route.path);
      const mdAbsolute = join(outDir, mdRelative);
      mkdirSync(dirname(mdAbsolute), { recursive: true });
      writeFileSync(mdAbsolute, markdown, "utf8");
    }
  }

  writeFileSync(join(outDir, "404.html"), notFoundHtmlDocument(), "utf8");
  writeFileSync(
    join(outDir, "sitemap.xml"),
    sitemapXml(
      DEEP_LINK_ROUTES.map((route) => route.path),
      SITE_SITEMAP_LASTMOD,
    ),
    "utf8",
  );
  writeFileSync(join(outDir, "llms.txt"), llmsTxt(), "utf8");
  if (existsSync(HEADERS_SOURCE)) {
    copyFileSync(HEADERS_SOURCE, join(outDir, "_headers"));
  }
}
