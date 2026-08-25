import { describe, expect, it } from "vitest";
import { pageMetaForPath } from "../meta/route-manifest";
import { stampAgentDocument } from "./stamp-document";

const SHELL = `<!doctype html>
<html lang="en">
  <head></head>
  <body>
    <div id="app"></div>
  </body>
</html>
`;

describe("stampAgentDocument", () => {
  it("injects Person JSON-LD, markdown alternate, and clipped crawler HTML", () => {
    const html = stampAgentDocument(SHELL, pageMetaForPath("/"));
    expect(html).toContain('type="application/ld+json"');
    expect(html).toContain('"@type":"Person"');
    expect(html).toContain('"@type":"Organization"');
    expect(html).toContain('rel="alternate" type="text/markdown"');
    expect(html).toContain("index.md");
    expect(html).toMatch(/<h1>Vishal Kumar<\/h1>/);
    expect(html).toContain("data-crawler-content");
    expect(html).toContain("clip:rect(0,0,0,0)");
  });

  it("throws when the SPA mount is missing", () => {
    expect(() => stampAgentDocument("<html></html>", pageMetaForPath("/"))).toThrow(/div id="app"/);
  });
});
