#!/usr/bin/env bun
/**
 * Apply vishalk.com zone settings so AI crawlers reach origin.
 *
 *   CLOUDFLARE_API_TOKEN=... bun scripts/allow-ai-crawlers.mjs
 *
 * Needs a token with Zone Bot Management Write + Zone WAF Write on vishalk.com.
 * Without a token: exits 0 when ALLOW_AI_CRAWLERS_OPTIONAL=1 (CI skip);
 * otherwise runs the live apex verifier (fail if crawlers/origin regress).
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  WAF_SKIP_DESCRIPTION,
  botManagementAllowlistPatch,
  wafSkipRule,
} from "../src/agent/ai-crawler-allowlist.ts";
import { allowAiCrawlersPlan } from "../src/agent/allow-ai-crawlers-policy.ts";

const API = "https://api.cloudflare.com/client/v4";
const ZONE_NAME = process.env.CLOUDFLARE_ZONE_NAME ?? "vishalk.com";
const OPTIONAL = process.env.ALLOW_AI_CRAWLERS_OPTIONAL === "1";

function firstNonEmpty(...values) {
  for (const value of values) {
    if (typeof value === "string" && value.trim() !== "") return value.trim();
  }
  return "";
}

function tokenFromWranglerConfig() {
  const candidates = [
    join(homedir(), ".config/.wrangler/config/default.toml"),
    join(homedir(), ".wrangler/config/default.toml"),
  ];
  for (const path of candidates) {
    if (!existsSync(path)) continue;
    const match = readFileSync(path, "utf8").match(/oauth_token\s*=\s*"([^"]+)"/);
    if (match?.[1]) return match[1];
  }
  return "";
}

const TOKEN = firstNonEmpty(
  process.env.CLOUDFLARE_API_TOKEN,
  process.env.CF_API_TOKEN,
  tokenFromWranglerConfig(),
);

function headers() {
  return {
    Authorization: `Bearer ${TOKEN}`,
    "Content-Type": "application/json",
  };
}

async function cf(method, path, body) {
  const init = { method, headers: headers() };
  if (body !== undefined) init.body = JSON.stringify(body);
  const response = await fetch(`${API}${path}`, init);
  const json = await response.json();
  if (!response.ok || json.success === false) {
    const detail = JSON.stringify(json.errors ?? json, null, 2);
    throw new Error(`${method} ${path} → ${response.status}\n${detail}`);
  }
  return json.result;
}

async function disableManagedBots(zoneId) {
  const current = await cf("GET", `/zones/${zoneId}/bot_management`);
  const path = `/zones/${zoneId}/bot_management`;
  try {
    await cf("PUT", path, botManagementAllowlistPatch(current, "full"));
    console.log(
      "bot_management: ai_bots_protection=disabled, is_robots_txt_managed=false, cf_robots_variant=off, crawler_protection=disabled",
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`bot_management full patch failed, retrying minimal:\n${message}`);
    await cf("PUT", path, botManagementAllowlistPatch(current, "minimal"));
    console.log("bot_management: ai_bots_protection=disabled, is_robots_txt_managed=false");
  }
}

async function upsertSkipRule(zoneId) {
  const entryPath = `/zones/${zoneId}/rulesets/phases/http_request_firewall_custom/entrypoint`;
  let existing = [];
  let missingEntrypoint = false;
  try {
    const entry = await cf("GET", entryPath);
    existing = Array.isArray(entry.rules) ? entry.rules : [];
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!message.includes("404")) throw error;
    missingEntrypoint = true;
  }
  const kept = existing.filter((rule) => rule.description !== WAF_SKIP_DESCRIPTION);
  const variants = ["full", "minimal"];
  let lastError;
  for (const variant of variants) {
    const rules = [wafSkipRule(variant), ...kept];
    try {
      if (missingEntrypoint) {
        await cf("POST", `/zones/${zoneId}/rulesets`, {
          name: "default",
          kind: "zone",
          phase: "http_request_firewall_custom",
          rules,
        });
        missingEntrypoint = false;
      } else {
        await cf("PUT", entryPath, { rules });
      }
      console.log(`custom WAF skip (${variant}): ${rules[0].expression}`);
      return;
    } catch (error) {
      lastError = error;
      const message = error instanceof Error ? error.message : String(error);
      console.error(`waf skip ${variant} failed:\n${message}`);
      missingEntrypoint = false;
    }
  }
  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}

const plan = allowAiCrawlersPlan(TOKEN !== "", OPTIONAL);
if (plan === "skip") {
  console.log("CLOUDFLARE_API_TOKEN missing — skipping zone apply (ALLOW_AI_CRAWLERS_OPTIONAL=1).");
  process.exit(0);
}
if (plan === "verify-live") {
  const origin = process.env.AGENT_VERIFY_ORIGIN ?? `https://${ZONE_NAME}`;
  console.log(
    "CLOUDFLARE_API_TOKEN missing — cannot change the zone. Verifying live origin instead.",
  );
  const verifier = join(dirname(fileURLToPath(import.meta.url)), "verify-agent-readiness.mjs");
  const result = spawnSync(process.execPath, [verifier, origin], {
    stdio: "inherit",
  });
  process.exit(result.status ?? 1);
}

const zones = await cf("GET", `/zones?name=${encodeURIComponent(ZONE_NAME)}`);
const zone = Array.isArray(zones) ? zones[0] : undefined;
const zoneId = zone?.id;
if (!zoneId) {
  throw new Error(`No Cloudflare zone named ${ZONE_NAME}`);
}
console.log(`zone ${ZONE_NAME} ${zoneId}`);

const failures = [];
for (const [name, fn] of [
  ["bot_management", () => disableManagedBots(zoneId)],
  ["waf_skip", () => upsertSkipRule(zoneId)],
]) {
  try {
    await fn();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`${name} failed:\n${message}`);
    failures.push(name);
  }
}

if (failures.length === 2) {
  process.exit(1);
}
if (failures.length > 0) {
  console.log(`partial apply (${failures.join(", ")} failed)`);
}
console.log("done");
