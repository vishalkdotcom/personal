import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  AI_CRAWLER_UA_TOKENS,
  BOT_MANAGEMENT_ALLOWLIST,
  WAF_SKIP_DESCRIPTION,
  botManagementAllowlistPatch,
  wafSkipActionParameters,
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

  it("turns off Block AI bots, managed robots.txt, Content Signals, and the AI link maze", () => {
    const patched = botManagementAllowlistPatch(
      {
        fight_mode: true,
        ai_bots_protection: "block",
        is_robots_txt_managed: true,
        cf_robots_variant: "policy_only",
        crawler_protection: "enabled",
        stale_zone_configuration: { fight_mode: true },
        using_latest_model: true,
      },
      "full",
    );
    expect(patched).toMatchObject({
      fight_mode: true,
      ...BOT_MANAGEMENT_ALLOWLIST,
    });
    expect(patched).not.toHaveProperty("stale_zone_configuration");
    expect(patched).not.toHaveProperty("using_latest_model");

    const minimal = botManagementAllowlistPatch({ ai_bots_protection: "block" }, "minimal");
    expect(minimal.ai_bots_protection).toBe("disabled");
    expect(minimal.is_robots_txt_managed).toBe(false);
    expect(minimal).not.toHaveProperty("cf_robots_variant");
  });

  it("skips remaining custom WAF rules plus Super Bot Fight Mode for matching UAs", () => {
    const parameters = wafSkipActionParameters();
    expect(parameters.ruleset).toBe("current");
    expect(parameters.phases).toContain("http_request_sbfm");
    expect(parameters.products).toEqual(
      expect.arrayContaining(["uaBlock", "bic", "securityLevel", "waf"]),
    );
  });

  it("keeps the zone apply script on the shared Bot Management and WAF skip helpers", () => {
    const script = readFileSync(resolve("scripts/allow-ai-crawlers.mjs"), "utf8");
    expect(script).toContain("botManagementAllowlistPatch");
    expect(script).toContain("wafSkipActionParameters");
    expect(script).toContain('from "../src/agent/ai-crawler-allowlist.ts"');
  });
});
