import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { visibleTextFromHtml } from "../agent/copy";
import { emitMetaShells } from "./emit-meta-shells";
import { DEEP_LINK_ROUTES, pageMetaForPath } from "./route-manifest";
import { OG_IMAGE_URL, SITE_HOST, SITE_NAME, SITE_ORIGIN } from "./site";
import { escapeHtmlAttr, shellOutputPath, stampMetaShell } from "./stamp-meta-shell";

const SPA_SHELL = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Vishal Kumar</title>
    <link rel="icon" href="/favicon.ico" sizes="any" />
  </head>
  <body>
    <div id="app"></div>
  </body>
</html>
`;

describe("Stamped meta shells (build output seam)", () => {
  let tempRoot: string | undefined;

  afterEach(() => {
    if (tempRoot) {
      rmSync(tempRoot, { recursive: true, force: true });
      tempRoot = undefined;
    }
  });

  it("stamps title, description, OG, and canonical into the SPA shell", () => {
    const meta = pageMetaForPath("/");
    const html = stampMetaShell(SPA_SHELL, meta);

    expect(html).toContain(`<title data-sm="stamp-title">${SITE_NAME}</title>`);
    expect(html).toContain(
      `<meta data-sm="stamp-description" name="description" content="${escapeHtmlAttr(meta.description)}" />`,
    );
    expect(html).toContain(
      `<meta data-sm="stamp-og-title" property="og:title" content="${escapeHtmlAttr(meta.title)}" />`,
    );
    expect(html).toContain(
      `<meta data-sm="stamp-og-description" property="og:description" content="${escapeHtmlAttr(meta.description)}" />`,
    );
    expect(html).toContain(
      `<meta data-sm="stamp-og-url" property="og:url" content="${SITE_ORIGIN}/" />`,
    );
    expect(html).toContain(`<meta data-sm="stamp-og-type" property="og:type" content="website" />`);
    expect(html).toContain(
      `<meta data-sm="stamp-og-site-name" property="og:site_name" content="${SITE_HOST}" />`,
    );
    expect(html).toContain(
      `<meta data-sm="stamp-og-image" property="og:image" content="${OG_IMAGE_URL}" />`,
    );
    expect(html).toContain(
      `<meta data-sm="stamp-twitter-card" name="twitter:card" content="summary_large_image" />`,
    );
    expect(html).toContain(
      `<meta data-sm="stamp-twitter-image" name="twitter:image" content="${OG_IMAGE_URL}" />`,
    );
    expect(html).toContain(
      `<link data-sm="stamp-canonical" rel="canonical" href="${SITE_ORIGIN}/" />`,
    );
    expect(html).toContain('rel="me" href="https://www.linkedin.com/in/vishalkdotcom"');
    expect(html).toContain('rel="me" href="https://github.com/vishalkdotcom"');
    // Cold-load contract: meta present before any client mount markup changes.
    expect(html.indexOf("<title")).toBeLessThan(html.indexOf('id="app"'));
  });

  it("escapes attribute-sensitive characters in stamped meta", () => {
    const html = stampMetaShell(SPA_SHELL, {
      path: "/x",
      title: `A <B> & "C"`,
      description: `Say "hello" & <bye>`,
      canonical: `${SITE_ORIGIN}/x`,
    });

    expect(html).toContain('<title data-sm="stamp-title">A &lt;B&gt; &amp; "C"</title>');
    expect(html).toContain('content="Say &quot;hello&quot; &amp; &lt;bye&gt;"');
  });

  it("emits per-path HTML shells for the finite deep-link set", () => {
    tempRoot = mkdtempSync(join(tmpdir(), "meta-shells-"));
    writeFileSync(join(tempRoot, "index.html"), SPA_SHELL, "utf8");

    emitMetaShells(tempRoot);

    for (const route of DEEP_LINK_ROUTES) {
      const relative = shellOutputPath(route.path);
      const absolute = join(tempRoot, relative);
      const html = readFileSync(absolute, "utf8");
      expect(html).toContain(`<title data-sm="stamp-title">${route.title}</title>`);
      expect(html).toContain(`content="${escapeHtmlAttr(route.description)}"`);
      expect(html).toContain(`href="${escapeHtmlAttr(route.canonical)}"`);
      expect(html).toContain('data-sm="stamp-canonical"');
      expect(html).toContain(`property="og:image" content="${OG_IMAGE_URL}"`);
      expect(html).toContain(`name="twitter:card" content="summary_large_image"`);
      expect(html).toContain('type="application/ld+json"');
      expect(html).toContain("<h1>");
      expect(html).toContain('rel="alternate" type="text/markdown"');
    }

    const notFound = readFileSync(join(tempRoot, "404.html"), "utf8");
    expect(notFound).toContain("<h1>");
    expect(notFound).toContain("sitemap.xml");
    expect(notFound).toContain("llms.txt");

    const sitemap = readFileSync(join(tempRoot, "sitemap.xml"), "utf8");
    expect(sitemap).toContain("<lastmod>");
    expect(sitemap).toContain("https://vishalk.com/about");
    expect(sitemap).toContain("https://vishalk.com/contact");
    expect(sitemap).not.toContain("https://vishalk.com/privacy");

    const llms = readFileSync(join(tempRoot, "llms.txt"), "utf8");
    expect(llms).toContain("## When to use this");
    expect(llms).not.toContain("/privacy");
    expect(readFileSync(join(tempRoot, "about.md"), "utf8")).toMatch(/^# /);
    expect(readFileSync(join(tempRoot, "contact.md"), "utf8").length).toBeGreaterThan(500);

    const home = readFileSync(join(tempRoot, "index.html"), "utf8");
    expect(home).toContain('"@type":"Person"');
    expect(home).toContain('"@type":"Organization"');
    expect(home).toContain('"@type":"WebSite"');
    expect(home).toContain('"vishalk.com"');
    expect(home).toContain("Vishal Kumar");
    expect(visibleTextFromHtml(home).length).toBeGreaterThanOrEqual(500);
    expect(readFileSync(join(tempRoot, "_headers"), "utf8")).toMatch(/Vary:\s*Accept/);
  });

  it("maps deep-link paths to Cloudflare pretty-URL shell files", () => {
    expect(shellOutputPath("/")).toBe("index.html");
    expect(shellOutputPath("/resume")).toBe("resume.html");
    expect(shellOutputPath("/work/labor-solutions/engage-reporting")).toBe(
      "work/labor-solutions/engage-reporting.html",
    );
  });
});
