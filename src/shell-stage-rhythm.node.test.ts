import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function read(rel: string): string {
  return readFileSync(resolve(process.cwd(), rel), "utf8");
}

describe("App Shell stage rhythm and rail modules (component / utility contract)", () => {
  it("authors bordered Context Rail modules as Tailwind utilities on RailModule", () => {
    const source = read("src/shell/rail-module.tsx");
    expect(source).toContain("border-border");
    expect(source).toContain("rounded-lg");
    expect(source).toContain("bg-bg-panel");
    expect(source).toContain("p-3");
    expect(source).toContain('data-rail-module=""');
  });

  it("authors locked ~28–32px stage titles and generous stage padding as utilities", () => {
    const title = read("src/shell/stage-title.tsx");
    const shell = read("src/shell/stage-shell.tsx");
    expect(title).toContain("text-[28px]");
    expect(title).toContain("text-[32px]");
    expect(shell).toContain("p-[28px_36px_100px]");
    expect(shell).toContain("p-[20px_16px_64px]");
  });

  it("authors Resume bleed margins that cancel desktop and mobile stage padding", () => {
    const shell = read("src/shell/stage-shell.tsx");
    expect(shell).toContain("in-[[data-stage=desktop]]:m-[-28px_-36px_-100px]");
    expect(shell).toContain("in-[[data-stage=mobile]]:m-[-20px_-16px_-64px]");
  });

  it("keeps presentational vk-* globals out of styles.css except the scrollbar exception", () => {
    const css = read("src/styles.css");
    expect(css).toMatch(/\.vk-scroll\s*\{/);
    expect(css).not.toMatch(/\.vk-rail-module\s*\{/);
    expect(css).not.toMatch(/\.vk-stage\s*\{/);
    expect(css).not.toMatch(/\.vk-stage-title\s*\{/);
    expect(css).not.toMatch(/\.vk-resume-viewer\s*\{/);
  });
});
