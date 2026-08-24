import { describe, expect, it } from "vitest";
import { HTML_TYPE, MARKDOWN_TYPE, preferredProducedType } from "./accept";
import {
  CONTACT_PARAGRAPHS,
  HOME_PARAGRAPHS,
  crawlableHtmlForPath,
  isKnownDocumentPath,
  llmsTxt,
  markdownForPath,
  sitemapXml,
  visibleText,
} from "./content";
import { CONTACT_POINT, POSTAL_ADDRESS, jsonLdGraph } from "./identity";
import { negotiateAgentRequest } from "./negotiate";
import { NOT_FOUND_MARKDOWN } from "./not-found";
import { PRIVACY_BODY } from "../privacy/content";
import { SITE_ORIGIN } from "../meta/site";

function stripHtml(html: string): string {
  return visibleText(html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<[^>]+>/g, " "));
}

describe("Accept parsing", () => {
  it("defaults missing Accept to HTML", () => {
    expect(preferredProducedType(null)).toBe(HTML_TYPE);
    expect(preferredProducedType("")).toBe(HTML_TYPE);
  });

  it("prefers markdown when listed first at equal q", () => {
    expect(preferredProducedType("text/markdown, text/html")).toBe(MARKDOWN_TYPE);
    expect(preferredProducedType("text/markdown")).toBe(MARKDOWN_TYPE);
  });

  it("honors q-values and explicit rejection", () => {
    expect(preferredProducedType("text/html;q=0.8, text/markdown")).toBe(MARKDOWN_TYPE);
    expect(preferredProducedType("text/markdown;q=0, text/html")).toBe(HTML_TYPE);
    expect(preferredProducedType("application/pdf")).toBeNull();
  });
});

describe("Crawlable HTML and trust pages", () => {
  it("puts an H1 and 500+ visible chars on home, about, contact, and privacy", () => {
    for (const path of ["/", "/about", "/contact", "/privacy"]) {
      const html = crawlableHtmlForPath(path);
      expect(html, path).toBeTruthy();
      expect(html, path).toMatch(/<h1>[^<]+<\/h1>/);
      expect(stripHtml(html!).length, path).toBeGreaterThanOrEqual(500);
    }
    expect(visibleText(HOME_PARAGRAPHS.join(" ")).length).toBeGreaterThanOrEqual(500);
    expect(visibleText(CONTACT_PARAGRAPHS.join(" ")).length).toBeGreaterThanOrEqual(500);
    expect(visibleText(PRIVACY_BODY).length).toBeGreaterThanOrEqual(500);
  });

  it("knows Mode, trust, and Work Case paths and rejects unknown ones", () => {
    expect(isKnownDocumentPath("/")).toBe(true);
    expect(isKnownDocumentPath("/about")).toBe(true);
    expect(isKnownDocumentPath("/privacy")).toBe(true);
    expect(isKnownDocumentPath("/work/labor-solutions/engage-reporting")).toBe(true);
    expect(isKnownDocumentPath("/some-path-that-does-not-exist")).toBe(false);
    expect(isKnownDocumentPath("/work/labor-solutions")).toBe(false);
  });
});

describe("JSON-LD identity", () => {
  it("emits Person, Organization with contactPoint+address, and WebSite", () => {
    const graph = jsonLdGraph();
    const nodes = graph["@graph"] as Record<string, unknown>[];
    const types = nodes.map((node) => node["@type"]);
    expect(types).toContain("Person");
    expect(types).toContain("Organization");
    expect(types).toContain("WebSite");

    const org = nodes.find((node) => node["@type"] === "Organization")!;
    expect(org.contactPoint).toEqual(CONTACT_POINT);
    expect(org.address).toEqual(POSTAL_ADDRESS);
    expect(org.email).toBe("hello@vishalk.com");

    const person = nodes.find((node) => node["@type"] === "Person")!;
    expect(person.url).toBe(`${SITE_ORIGIN}/`);
    expect(person.sameAs).toEqual(expect.arrayContaining(["https://github.com/vishalkdotcom"]));
  });
});

describe("llms.txt and sitemap", () => {
  it("follows llmstxt.org v2 order with when-to-use guidance in the free body", () => {
    const text = llmsTxt();
    const h1 = text.indexOf("# Vishal Kumar");
    const quote = text.indexOf(">");
    const when = text.indexOf("When to use this:");
    const how = text.indexOf("How an agent should call this site:");
    const pages = text.indexOf("## Pages");
    const optional = text.indexOf("## Optional");
    expect(h1).toBe(0);
    expect(quote).toBeGreaterThan(h1);
    expect(when).toBeGreaterThan(quote);
    expect(how).toBeGreaterThan(when);
    expect(pages).toBeGreaterThan(how);
    expect(optional).toBeGreaterThan(pages);
    expect(text.slice(quote, pages)).not.toMatch(/^## /m);
    expect(text).toContain(`${SITE_ORIGIN}/contact.md`);
    expect(text).toContain("POST JSON");
  });

  it("lists indexable locs with lastmod under 50MB", () => {
    const xml = sitemapXml(new Date("2026-08-24T12:00:00.000Z"));
    expect(xml.startsWith("<?xml")).toBe(true);
    expect(xml).toContain(`<lastmod>2026-08-24</lastmod>`);
    expect(xml).toContain(`<loc>${SITE_ORIGIN}/privacy</loc>`);
    expect(Buffer.byteLength(xml, "utf8")).toBeLessThan(50 * 1024 * 1024);
  });
});

describe("Agent request negotiation", () => {
  async function fetchAsset(request: Request): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/")) {
      return new Response("api", { status: 200 });
    }
    if (url.pathname === "/og.png") {
      return new Response("png", { status: 200, headers: { "content-type": "image/png" } });
    }
    return new Response("<html>shell</html>", {
      status: 200,
      headers: { "content-type": "text/html; charset=utf-8", vary: "accept-encoding" },
    });
  }

  it("returns HTTP 404 with markdown guidance for unknown paths", async () => {
    const res = await negotiateAgentRequest(
      new Request("https://vishalk.com/some-path-that-does-not-exist"),
      fetchAsset,
    );
    expect(res.status).toBe(404);
    const body = await res.text();
    expect(body).toContain("llms.txt");
    expect(body).toContain("sitemap.xml");
    expect(res.headers.get("vary")?.toLowerCase()).toContain("accept");
  });

  it("serves text/markdown with Vary: Accept on known paths", async () => {
    const res = await negotiateAgentRequest(
      new Request("https://vishalk.com/", { headers: { Accept: "text/markdown" } }),
      fetchAsset,
    );
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("text/markdown; charset=utf-8");
    expect(res.headers.get("vary")?.toLowerCase()).toMatch(/accept/);
    expect(res.headers.get("vary")?.toLowerCase()).toMatch(/accept-encoding/);
    const body = await res.text();
    expect(body.startsWith("# Vishal Kumar")).toBe(true);
    expect(body.length).toBeGreaterThan(500);
  });

  it("404s markdown for unknown paths and 406s unsupported types", async () => {
    const missing = await negotiateAgentRequest(
      new Request("https://vishalk.com/nope", { headers: { Accept: "text/markdown" } }),
      fetchAsset,
    );
    expect(missing.status).toBe(404);
    expect(missing.headers.get("content-type")).toBe("text/markdown; charset=utf-8");
    expect(await missing.text()).toBe(NOT_FOUND_MARKDOWN);

    const notAcceptable = await negotiateAgentRequest(
      new Request("https://vishalk.com/", { headers: { Accept: "application/pdf" } }),
      fetchAsset,
    );
    expect(notAcceptable.status).toBe(406);
  });

  it("passes /api and static assets through and wraps HTML with Vary: Accept", async () => {
    const api = await negotiateAgentRequest(
      new Request("https://vishalk.com/api/contact", { method: "POST" }),
      fetchAsset,
    );
    expect(await api.text()).toBe("api");

    const png = await negotiateAgentRequest(new Request("https://vishalk.com/og.png"), fetchAsset);
    expect(await png.text()).toBe("png");

    const html = await negotiateAgentRequest(new Request("https://vishalk.com/about"), fetchAsset);
    expect(html.status).toBe(200);
    expect(html.headers.get("content-type")).toContain("text/html");
    expect(html.headers.get("vary")?.toLowerCase()).toContain("accept");
    expect(html.headers.get("link")).toContain('rel="alternate"');
    expect(html.headers.get("link")).toContain("/llms.txt");
    expect(markdownForPath("/about")).toContain("Vishal Kumar");
  });
});
