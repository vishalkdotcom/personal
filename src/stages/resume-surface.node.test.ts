import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("Resume Surface framed viewer (App Shell seam)", () => {
  const css = () => readFileSync(resolve(process.cwd(), "src/styles.css"), "utf8");
  const viewer = () => readFileSync(resolve(process.cwd(), "src/stages/resume-viewer.tsx"), "utf8");

  it("defines theme-token Resume well / shadow values for light and dark", () => {
    const source = css();
    expect(source).toMatch(
      /\[data-theme="light"\]\s*\{[^}]*--vk-resume-shadow:\s*rgba\(26,\s*28,\s*30,\s*0\.14\)/s,
    );
    expect(source).toMatch(
      /\[data-theme="dark"\]\s*\{[^}]*--vk-resume-well:\s*#0e1012[^}]*--vk-resume-shadow:\s*rgba\(0,\s*0,\s*0,\s*0\.45\)/s,
    );
    expect(source).toMatch(
      /--color-resume-well:\s*var\(--vk-resume-well,\s*var\(--vk-bg-hover\)\)/,
    );
    expect(source).toMatch(/--shadow-resume:\s*0\s+16px\s+48px\s+var\(--vk-resume-shadow\)/);
  });

  it("authors framed viewer surround with toolbar, frame, and embed as Tailwind utilities", () => {
    const source = viewer();
    expect(source).toContain("bg-resume-well");
    expect(source).toContain("bg-bg-deep");
    expect(source).toContain("text-muted");
    expect(source).toContain("min-h-[480px]");
    expect(source).toContain("shadow-resume");
    expect(source).toContain("min-h-0");
    expect(css()).not.toMatch(/\.vk-resume-viewer\s*\{/);
  });
});
