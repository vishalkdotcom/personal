import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const ALLOWED_AGENTS = [
  "GPTBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Google-Extended",
  "PerplexityBot",
  "DeepSeekBot",
  "ora-agent",
];

describe("robots.txt AI crawler allowlist", () => {
  const robots = readFileSync(resolve("static/robots.txt"), "utf8");

  it("allows major agent User-Agents and advertises the sitemap", () => {
    expect(robots).toMatch(/^User-agent: \*\s*$/m);
    expect(robots).toMatch(/^Allow: \/$/m);
    expect(robots).toContain("Sitemap: https://vishalk.com/sitemap.xml");
    for (const agent of ALLOWED_AGENTS) {
      expect(robots, agent).toContain(`User-agent: ${agent}`);
      const block = robots.split("User-agent: ").find((chunk) => chunk.startsWith(`${agent}\n`));
      expect(block, agent).toBeTruthy();
      expect(block, agent).toMatch(/^Allow: \/$/m);
    }
  });
});
