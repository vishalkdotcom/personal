import { describe, expect, it } from "vitest";
import {
  aboutMarkdown,
  contactMarkdown,
  crawlerHtmlForPath,
  identityJsonLd,
  llmsTxt,
  markdownForPath,
  privacyMarkdown,
  sitemapXml,
  visibleTextFromHtml,
} from "./copy";

function graphTypes(json: unknown): string[] {
  const record = json as { "@graph"?: Array<{ "@type"?: string }> };
  return (record["@graph"] ?? []).map((node) => String(node["@type"] ?? ""));
}

describe("Agent documents", () => {
  it("puts 500+ visible characters and an H1 on home, about, contact, and privacy HTML", () => {
    for (const path of ["/", "/about", "/contact", "/privacy"] as const) {
      const html = crawlerHtmlForPath(path);
      expect(html, path).toMatch(/<h1>/i);
      expect(visibleTextFromHtml(html).length, path).toBeGreaterThanOrEqual(500);
    }
  });

  it("keeps markdown bodies in lockstep with HTML for the trust pages", () => {
    expect(markdownForPath("/")).toBe(aboutMarkdown());
    expect(markdownForPath("/about")).toBe(aboutMarkdown());
    expect(markdownForPath("/contact")).toBe(contactMarkdown());
    expect(markdownForPath("/privacy")).toBe(privacyMarkdown());
    expect(privacyMarkdown().length).toBeGreaterThanOrEqual(500);
    expect(contactMarkdown().length).toBeGreaterThanOrEqual(500);
  });

  it("emits Person + Organization JSON-LD with contactPoint and address", () => {
    const json = identityJsonLd() as {
      "@graph": Array<Record<string, unknown>>;
    };
    expect(graphTypes(json)).toEqual(["Person", "Organization"]);
    const org = json["@graph"].find((node) => node["@type"] === "Organization");
    expect(org?.contactPoint).toMatchObject({
      "@type": "ContactPoint",
      email: expect.stringContaining("@"),
      contactType: "customer support",
    });
    expect(org?.address).toMatchObject({
      "@type": "PostalAddress",
      addressCountry: "IN",
    });
  });

  it("writes llms.txt with a when-to-use section in spec order", () => {
    const text = llmsTxt();
    expect(text.startsWith("# ")).toBe(true);
    expect(text).toMatch(/^> /m);
    expect(text).toMatch(/## When to use this/);
    const whenIndex = text.indexOf("## When to use this");
    const pagesIndex = text.indexOf("## Pages");
    expect(whenIndex).toBeGreaterThan(0);
    expect(pagesIndex).toBeGreaterThan(whenIndex);
    expect(text.slice(whenIndex, pagesIndex)).toMatch(/- \[/);
  });

  it("emits a sitemap with lastmod for every listed path", () => {
    const xml = sitemapXml(["/", "/about", "/privacy"], "2026-08-24");
    expect(xml).toContain('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"');
    expect(xml).toContain("<lastmod>2026-08-24</lastmod>");
    expect(xml).toContain("<loc>https://vishalk.com/</loc>");
    expect(xml).toContain("<loc>https://vishalk.com/about</loc>");
    expect(xml).toContain("<loc>https://vishalk.com/privacy</loc>");
  });
});
