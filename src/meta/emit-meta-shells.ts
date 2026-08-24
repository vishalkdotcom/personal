import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { crawlableHtmlForPath, llmsTxt, markdownForPath, sitemapXml } from "../agent/content";
import { jsonLdScriptContent } from "../agent/identity";
import { notFoundHtml } from "../agent/not-found";
import { DEEP_LINK_ROUTES } from "./route-manifest";
import { markdownOutputPath, shellOutputPath } from "./shell-paths";
import { stampJsonLd, stampMetaShell, stampSnapshot } from "./stamp-meta-shell";

function stampDocument(templateHtml: string, path: string): string {
  const route = DEEP_LINK_ROUTES.find((entry) => entry.path === path);
  if (!route) {
    throw new Error(`emitMetaShells: missing route meta for ${path}`);
  }
  let html = stampMetaShell(templateHtml, route);
  html = stampJsonLd(html, jsonLdScriptContent());
  const snapshot = crawlableHtmlForPath(path);
  if (snapshot) html = stampSnapshot(html, snapshot);
  return html;
}

/**
 * After Vite writes `dist/index.html`, stamp per-path meta shells, crawlable
 * snapshots, JSON-LD, markdown siblings, sitemap, llms.txt, and 404.html.
 */
export function emitMetaShells(outDir: string): void {
  const templatePath = join(outDir, "index.html");
  const template = readFileSync(templatePath, "utf8");

  for (const route of DEEP_LINK_ROUTES) {
    const relative = shellOutputPath(route.path);
    const absolute = join(outDir, relative);
    mkdirSync(dirname(absolute), { recursive: true });
    writeFileSync(absolute, stampDocument(template, route.path), "utf8");

    const markdown = markdownForPath(route.path);
    if (markdown) {
      const mdRelative = markdownOutputPath(route.path);
      const mdAbsolute = join(outDir, mdRelative);
      mkdirSync(dirname(mdAbsolute), { recursive: true });
      writeFileSync(mdAbsolute, markdown, "utf8");
    }
  }

  writeFileSync(join(outDir, "sitemap.xml"), sitemapXml(), "utf8");
  writeFileSync(join(outDir, "llms.txt"), llmsTxt(), "utf8");
  writeFileSync(join(outDir, "404.html"), notFoundHtml(), "utf8");
}
