#!/usr/bin/env bun
/**
 * Apply vishalk.com zone settings so AI crawlers reach origin.
 *
 *   CLOUDFLARE_API_TOKEN=... bun scripts/allow-ai-crawlers.mjs
 *
 * Needs a token with Zone Bot Management Write + Zone WAF Write on vishalk.com.
 * Without a token, exits 0 when ALLOW_AI_CRAWLERS_OPTIONAL=1 (CI skip), else 2.
 */
import {
  AI_CRAWLER_UA_TOKENS,
  WAF_SKIP_DESCRIPTION,
  wafSkipExpression,
} from "../src/agent/ai-crawler-allowlist.ts";

const API = "https://api.cloudflare.com/client/v4";
const ZONE_NAME = process.env.CLOUDFLARE_ZONE_NAME ?? "vishalk.com";
const TOKEN = process.env.CLOUDFLARE_API_TOKEN ?? process.env.CF_API_TOKEN ?? "";
const OPTIONAL = process.env.ALLOW_AI_CRAWLERS_OPTIONAL === "1";

const SKIP_RULE = {
  description: WAF_SKIP_DESCRIPTION,
  expression: wafSkipExpression(AI_CRAWLER_UA_TOKENS),
  action: "skip",
  action_parameters: {
    phases: ["http_request_sbfm"],
    products: ["uaBlock", "bic", "securityLevel", "waf"],
  },
  enabled: true,
};

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

function withoutReadonlyBotFields(config) {
  const { stale_zone_configuration: _stale, using_latest_model: _model, ...rest } = config;
  return rest;
}

async function disableManagedBots(zoneId) {
  const current = await cf("GET", `/zones/${zoneId}/bot_management`);
  const next = {
    ...withoutReadonlyBotFields(current),
    ai_bots_protection: "disabled",
    is_robots_txt_managed: false,
  };
  await cf("PUT", `/zones/${zoneId}/bot_management`, next);
  console.log("bot_management: ai_bots_protection=disabled, is_robots_txt_managed=false");
}

async function upsertSkipRule(zoneId) {
  const path = `/zones/${zoneId}/rulesets/phases/http_request_firewall_custom/entrypoint`;
  let existing = [];
  try {
    const entry = await cf("GET", path);
    existing = Array.isArray(entry.rules) ? entry.rules : [];
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!message.includes("404")) throw error;
  }
  const kept = existing.filter((rule) => rule.description !== WAF_SKIP_DESCRIPTION);
  await cf("PUT", path, { rules: [SKIP_RULE, ...kept] });
  console.log(`custom WAF skip: ${SKIP_RULE.expression}`);
}

if (!TOKEN) {
  const msg =
    "CLOUDFLARE_API_TOKEN missing — cannot change the vishalk.com zone. Dashboard steps: README Deploy.";
  if (OPTIONAL) {
    console.log(msg);
    process.exit(0);
  }
  console.error(msg);
  process.exit(2);
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
