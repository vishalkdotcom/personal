import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("App Shell stage rhythm and rail modules (style contract)", () => {
  const css = () => readFileSync(resolve(process.cwd(), "src/styles.css"), "utf8");

  it("defines bordered Context Rail module chrome", () => {
    const source = css();
    expect(source).toMatch(/\.vk-rail-module\s*\{[^}]*border:\s*1px\s+solid\s+var\(--vk-border\)/s);
    expect(source).toMatch(/\.vk-rail-module\s*\{[^}]*border-radius:\s*8px/s);
    expect(source).toMatch(/\.vk-rail-module\s*\{[^}]*padding:\s*12px/s);
  });

  it("defines locked ~28–32px stage titles and generous stage padding", () => {
    const source = css();
    expect(source).toMatch(/\.vk-stage\s*\{[^}]*padding:\s*28px\s+36px\s+100px/s);
    expect(source).toMatch(/\.vk-stage-title\s*\{[^}]*font-size:\s*28px/s);
    expect(source).toMatch(/\.vk-stage-title-lg\s*\{[^}]*font-size:\s*32px/s);
  });

  it("defines Resume bleed margins that cancel desktop and mobile stage padding", () => {
    const source = css();
    expect(source).toMatch(
      /\.vk-stage\s*>\s*\.vk-stage-bleed\s*\{[^}]*margin:\s*-28px\s+-36px\s+-100px/s,
    );
    expect(source).toMatch(
      /\.vk-stage-mobile\s*>\s*\.vk-stage-bleed\s*\{[^}]*margin:\s*-20px\s+-16px\s+-64px/s,
    );
  });
});
