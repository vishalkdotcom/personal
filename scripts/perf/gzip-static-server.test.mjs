import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { resolvePrettyUrl, startGzipStaticServer } from "./gzip-static-server.mjs";

describe("resolvePrettyUrl", () => {
  it("maps Cloudflare pretty URLs to .html shells", () => {
    const root = mkdtempSync(join(tmpdir(), "perf-pretty-"));
    try {
      mkdirSync(join(root, "work", "labor-solutions"), { recursive: true });
      writeFileSync(join(root, "index.html"), "<html>home</html>");
      writeFileSync(
        join(root, "work", "labor-solutions", "engage-reporting.html"),
        "<html>engage</html>",
      );
      writeFileSync(join(root, "resume.html"), "<html>resume</html>");

      assert.match(resolvePrettyUrl(root, "/") || "", /index\.html$/);
      assert.match(
        resolvePrettyUrl(root, "/work/labor-solutions/engage-reporting") || "",
        /engage-reporting\.html$/,
      );
      assert.match(resolvePrettyUrl(root, "/resume") || "", /resume\.html$/);
      assert.equal(resolvePrettyUrl(root, "/missing"), null);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});

describe("startGzipStaticServer", () => {
  it("serves gzip JS when Accept-Encoding includes gzip", async () => {
    const root = mkdtempSync(join(tmpdir(), "perf-gzip-"));
    mkdirSync(join(root, "assets"), { recursive: true });
    writeFileSync(join(root, "assets", "app.js"), "console.log('hello-cutover-gate');");
    writeFileSync(join(root, "index.html"), "<html>ok</html>");

    const bound = await startGzipStaticServer(root, { port: 0 });
    try {
      const res = await fetch(`${bound.baseUrl}/assets/app.js`, {
        headers: { "Accept-Encoding": "gzip" },
      });
      assert.equal(res.status, 200);
      assert.equal(res.headers.get("content-encoding"), "gzip");
      const text = await res.text();
      assert.match(text, /hello-cutover-gate/);
    } finally {
      await bound.close();
      rmSync(root, { recursive: true, force: true });
    }
  });
});
