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

  it("disambiguates the common name with the canonical host in crawlable copy", () => {
    const markdown = aboutMarkdown();
    expect(markdown.startsWith("# Vishal Kumar of vishalk.com")).toBe(true);
    expect(markdown).toContain("Site: vishalk.com");
    expect(crawlerHtmlForPath("/")).toContain("<h1>Vishal Kumar of vishalk.com</h1>");
  });

  it("marks LinkedIn and GitHub as rel=me identity links in crawlable HTML", () => {
    const html = crawlerHtmlForPath("/");
    expect(html).toContain(`<a href="${LINKEDIN_HREF}" rel="me">`);
    expect(html).toContain(`<a href="${GITHUB_HREF}" rel="me">`);
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
      brand: { "@id": "https://vishalk.com/#org" },
      sameAs: [LINKEDIN_HREF, GITHUB_HREF],
      alternateName: ["vishalk.com", "vishalk", "vishalkdotcom"],
      description: expect.stringContaining("Vishal Kumar of vishalk.com"),
      disambiguatingDescription: expect.stringContaining("vishalk.com"),
    });
    const org = json["@graph"].find((node) => node["@type"] === "Organization");
    expect(org).toMatchObject({
      name: "vishalk.com",
      legalName: ABOUT_NAME,
      logo: "https://vishalk.com/og.png",
      alternateName: ["vishalk.com", "vishalk"],
    });
    const website = json["@graph"].find((node) => node["@type"] === "WebSite");
    expect(website).toMatchObject({
      "@id": "https://vishalk.com/#website",
      name: "vishalk.com",
      alternateName: [ABOUT_NAME, "vishalk"],
      url: "https://vishalk.com/",
      publisher: { "@id": "https://vishalk.com/#org" },
      about: { "@id": "https://vishalk.com/#person" },
    });
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
    expect(org).not.toHaveProperty("telephone");
    expect(person).not.toHaveProperty("telephone");
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
