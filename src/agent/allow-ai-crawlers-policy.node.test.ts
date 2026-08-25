import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { allowAiCrawlersPlan } from "./allow-ai-crawlers-policy";

describe("allowAiCrawlersPlan", () => {
  it("applies the zone when a token is present", () => {
    expect(allowAiCrawlersPlan(true, false)).toBe("apply");
    expect(allowAiCrawlersPlan(true, true)).toBe("apply");
  });

  it("skips on optional CI when the token is missing", () => {
    expect(allowAiCrawlersPlan(false, true)).toBe("skip");
  });

  it("verifies live apex when main has no token", () => {
    expect(allowAiCrawlersPlan(false, false)).toBe("verify-live");
  });

  it("keeps the zone script on the same plan helper", () => {
    const script = readFileSync(resolve("scripts/allow-ai-crawlers.mjs"), "utf8");
    expect(script).toContain("allowAiCrawlersPlan");
    expect(script).toContain("verify-agent-readiness.mjs");
  });
});
