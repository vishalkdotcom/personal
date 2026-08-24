import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("FOUC-safe theme boot", () => {
  it("ships an inline blocking script in index.html before any style source", () => {
    const html = readFileSync(resolve(process.cwd(), "index.html"), "utf8");
    const scriptIdx = html.indexOf("vk-theme");
    // First styled-paint trigger: external stylesheet or inline <style> (@font-face).
    const cssIdx = html.search(/rel=["']stylesheet["']|<style[\s>]/i);
    expect(scriptIdx).toBeGreaterThan(-1);
    expect(cssIdx).toBeGreaterThan(-1);
    expect(scriptIdx).toBeLessThan(cssIdx);
    expect(html).toMatch(/dataset\.theme|data-theme/);
    expect(html).toContain('id="app"');
    expect(html).toContain("<!-- app-shell-snapshot -->");
    expect(html.indexOf("<!-- app-shell-snapshot -->")).toBeGreaterThan(html.indexOf('id="app"'));
    expect(html).toContain("<!-- app-shell-jsonld -->");
  });
});
