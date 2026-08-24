import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  AI_CRAWLER_UA_TOKENS,
  WAF_SKIP_DESCRIPTION,
  wafSkipExpression,
} from "./ai-crawler-allowlist";

describe("AI crawler allowlist", () => {
  it("covers the six Is Agentic crawler tokens in robots.txt and the WAF expression", () => {
    const robots = readFileSync(resolve("static/robots.txt"), "utf8");
    const expression = wafSkipExpression();
    expect(AI_CRAWLER_UA_TOKENS).toHaveLength(6);
    for (const token of AI_CRAWLER_UA_TOKENS) {
      expect(robots, token).toMatch(new RegExp(`User-agent: ${token}\\s+Allow: /`));
      expect(expression).toContain(`http.user_agent contains "${token}"`);
    }
    expect(expression.startsWith("(")).toBe(true);
    expect(WAF_SKIP_DESCRIPTION).toMatch(/AI crawlers/);
  });

  it("keeps the live verifier on the same crawler tokens", () => {
    const verifier = readFileSync(resolve("scripts/verify-agent-readiness.mjs"), "utf8");
    expect(verifier).toContain('from "../src/agent/ai-crawler-allowlist.ts"');
    for (const token of AI_CRAWLER_UA_TOKENS) {
      expect(verifier, token).toMatch(new RegExp(`["']?${token}["']?\\s*:`));
    }
  });
});
