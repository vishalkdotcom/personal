import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("robots.txt AI crawler allowlist", () => {
  const robots = readFileSync(resolve("static/robots.txt"), "utf8");

  it("allows the major agent user-agents and lists the sitemap", () => {
    for (const agent of [
      "GPTBot",
      "ChatGPT-User",
      "ClaudeBot",
      "PerplexityBot",
      "Google-Extended",
      "DeepSeekBot",
    ]) {
      expect(robots, agent).toMatch(new RegExp(`User-agent: ${agent}\\s+Allow: /`, "i"));
    }
    expect(robots).toContain("Sitemap: https://vishalk.com/sitemap.xml");
    expect(robots).not.toMatch(/^# BEGIN Cloudflare Managed content/im);
    expect(robots).not.toMatch(/User-agent: GPTBot\s+Disallow:/i);
    expect(robots).not.toMatch(/User-agent: ClaudeBot\s+Disallow:/i);
    expect(robots).not.toMatch(/User-agent: Google-Extended\s+Disallow:/i);
  });
});
