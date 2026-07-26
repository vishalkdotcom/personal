import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("App Shell custom scrollbars (style contract)", () => {
  it("defines thin theme-token scrollbar rules for .vk-scroll", () => {
    const css = readFileSync(resolve(process.cwd(), "src/styles.css"), "utf8");
    expect(css).toMatch(/\.vk-scroll\s*\{[^}]*scrollbar-width:\s*thin/s);
    expect(css).toMatch(/scrollbar-color:\s*var\(--vk-border\)\s+transparent/);
    expect(css).toContain(".vk-scroll::-webkit-scrollbar");
    expect(css).toContain("var(--vk-bg-hover)");
  });
});
