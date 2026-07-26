import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("Resume Surface framed viewer CSS (App Shell seam)", () => {
  const css = () => readFileSync(resolve(process.cwd(), "src/styles.css"), "utf8");

  it("defines theme-token Resume well / shadow values for light and dark", () => {
    const source = css();
    expect(source).toMatch(
      /\[data-theme="light"\]\s*\{[^}]*--vk-resume-shadow:\s*rgba\(26,\s*28,\s*30,\s*0\.14\)/s,
    );
    expect(source).toMatch(
      /\[data-theme="dark"\]\s*\{[^}]*--vk-resume-well:\s*#0e1012[^}]*--vk-resume-shadow:\s*rgba\(0,\s*0,\s*0,\s*0\.45\)/s,
    );
  });

  it("authors a framed viewer surround with toolbar, frame, and embed rules", () => {
    const source = css();
    expect(source).toMatch(
      /\.vk-resume-viewer\s*\{[^}]*background:\s*var\(--vk-resume-well,\s*var\(--vk-bg-hover\)\)/s,
    );
    expect(source).toMatch(/\.vk-resume-toolbar\s*\{[^}]*background:\s*var\(--vk-bg-deep\)/s);
    expect(source).toMatch(/\.vk-resume-filename\s*\{[^}]*color:\s*var\(--vk-muted\)/s);
    expect(source).toMatch(/\.vk-resume-frame\s*\{[^}]*min-height:\s*480px/s);
    expect(source).toMatch(/\.vk-resume-embed\s*\{[^}]*min-height:\s*0/s);
  });
});
