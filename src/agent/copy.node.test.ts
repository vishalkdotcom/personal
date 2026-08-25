import { describe, expect, it } from "vitest";
import { ABOUT_NAME } from "../about/content";
import {
  aboutMarkdown,
  contactMarkdown,
  crawlerHtmlForPath,
  GITHUB_HREF,
  identityJsonLd,
  LINKEDIN_HREF,
  llmsTxt,
  markdownForPath,
  sitemapXml,
  visibleTextFromHtml,
} from "./copy";

function graphTypes(json: unknown): string[] {
  const record = json as { "@graph"?: Array<{ "@type"?: string }> };
  return (record["@graph"] ?? []).map((node) => String(node["@type"] ?? ""));
}

describe("Agent documents", () => {
  it("puts 500+ visible characters and an H1 on home, about, and contact HTML", () => {
    for (const path of ["/", "/about", "/contact"] as const) {
      const html = crawlerHtmlForPath(path);
      expect(html, path).toMatch(/<h1>/i);
      expect(visibleTextFromHtml(html).length, path).toBeGreaterThanOrEqual(500);
    }
  });

  it("keeps markdown bodies in lockstep with HTML for About and Contact", () => {
    expect(markdownForPath("/")).toBe(aboutMarkdown());
    expect(markdownForPath("/about")).toBe(aboutMarkdown());
    expect(markdownForPath("/contact")).toBe(contactMarkdown());
    expect(markdownForPath("/privacy")).toBeUndefined();
    expect(contactMarkdown().length).toBeGreaterThanOrEqual(500);
  });

  it("emits Person + Organization JSON-LD with contactPoint and address", () => {
    const json = identityJsonLd() as {
      "@graph": Array<Record<string, unknown>>;
    };
    expect(graphTypes(json)).toEqual(["Person", "Organization", "WebSite"]);
    const person = json["@graph"].find((node) => node["@type"] === "Person");
    expect(person).toMatchObject({
      name: ABOUT_NAME,
      givenName: "Vishal",
      familyName: "Kumar",
      sameAs: [LINKEDIN_HREF, GITHUB_HREF],
      alternateName: ["vishalk.com", "vishalk"],
    });
    const org = json["@graph"].find((node) => node["@type"] === "Organization");
    expect(org?.contactPoint).toMatchObject({
      "@type": "ContactPoint",
      email: expect.stringContaining("@"),
      contactType: "customer support",
    });
    expect(org?.address).toMatchObject({
      "@type": "PostalAddress",
      addressCountry: "IN",
      addressLocality: "Punjab",
    });
    expect(org).toMatchObject({
      name: ABOUT_NAME,
      alternateName: ["vishalk.com", "vishalk"],
    });
    expect(org).not.toHaveProperty("telephone");
    expect(person).not.toHaveProperty("telephone");
    const site = json["@graph"].find((node) => node["@type"] === "WebSite");
    expect(site).toMatchObject({
      "@id": "https://vishalk.com/#website",
      name: ABOUT_NAME,
      alternateName: ["vishalk.com", "vishalk"],
      url: "https://vishalk.com/",
      publisher: { "@id": "https://vishalk.com/#person" },
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
    expect(text).not.toContain("/privacy");
  });

  it("emits a sitemap with lastmod for every listed path", () => {
    const xml = sitemapXml(["/", "/about", "/contact"], "2026-08-24");
    expect(xml).toContain('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"');
    expect(xml).toContain("<lastmod>2026-08-24</lastmod>");
    expect(xml).toContain("<loc>https://vishalk.com/</loc>");
    expect(xml).toContain("<loc>https://vishalk.com/about</loc>");
    expect(xml).toContain("<loc>https://vishalk.com/contact</loc>");
    expect(xml).not.toContain("/privacy");
  });
});
