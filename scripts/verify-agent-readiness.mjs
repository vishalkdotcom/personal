#!/usr/bin/env bun
/**
 * Live checks for agent readiness. Usage:
 *   bun scripts/verify-agent-readiness.mjs https://cursor-agent-readiness-2a91.vishalk.pages.dev
 *   bun scripts/verify-agent-readiness.mjs https://vishalk.com
 */
import { AI_CRAWLER_UA_TOKENS } from "../src/agent/ai-crawler-allowlist.ts";

const base = (process.argv[2] ?? "https://vishalk.com").replace(/\/$/, "");

const BOTS = [...AI_CRAWLER_UA_TOKENS];

const BOT_UA = {
  GPTBot:
    "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.2; +https://openai.com/gptbot)",
  "ChatGPT-User":
    "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; ChatGPT-User/1.0; +https://openai.com/bot",
  ClaudeBot:
    "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; ClaudeBot/1.0; +claudebot@anthropic.com)",
  PerplexityBot:
    "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; PerplexityBot/1.0; +https://perplexity.ai/perplexitybot)",
  "Google-Extended": "Mozilla/5.0 (compatible; Google-Extended)",
  DeepSeekBot: "Mozilla/5.0 (compatible; DeepSeekBot/1.0; +https://www.deepseek.com/bot)",
};

for (const bot of BOTS) {
  if (!BOT_UA[bot]) {
    throw new Error(`verify-agent-readiness: missing User-Agent for ${bot}`);
  }
}

function visibleText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function get(path, init = {}) {
  const response = await fetch(`${base}${path}`, { redirect: "manual", ...init });
  const body = await response.text();
  return { response, body, status: response.status };
}

const failures = [];

function check(name, ok, detail = "") {
  const mark = ok ? "PASS" : "FAIL";
  console.log(`${mark}  ${name}${detail ? ` — ${detail}` : ""}`);
  if (!ok) failures.push(name);
}

console.log(`verify-agent-readiness ${base}\n`);

const unknown = await get("/this-path-does-not-exist-agent-ready");
check("unknown path is HTTP 404", unknown.status === 404, `status ${unknown.status}`);
check(
  "404 body points at sitemap and llms.txt",
  unknown.body.includes("sitemap.xml") && unknown.body.includes("llms.txt"),
);
check(
  "404 defaults to markdown for agents",
  (unknown.response.headers.get("content-type") ?? "").includes("text/markdown") &&
    unknown.body.startsWith("# Not found"),
  unknown.response.headers.get("content-type") ?? "",
);

const unknownHtml = await get("/this-path-does-not-exist-agent-ready", {
  headers: { Accept: "text/html,application/xhtml+xml,*/*;q=0.8" },
});
check(
  "404 stays HTML for browsers",
  unknownHtml.status === 404 &&
    (unknownHtml.response.headers.get("content-type") ?? "").includes("text/html"),
  unknownHtml.response.headers.get("content-type") ?? `status ${unknownHtml.status}`,
);

const unknownMd = await get("/this-path-does-not-exist-agent-ready", {
  headers: { Accept: "text/markdown" },
});
check(
  "404 Accept: text/markdown is markdown",
  unknownMd.status === 404 &&
    (unknownMd.response.headers.get("content-type") ?? "").includes("text/markdown") &&
    unknownMd.body.includes("sitemap.xml") &&
    unknownMd.body.includes("llms.txt"),
  unknownMd.response.headers.get("content-type") ?? `status ${unknownMd.status}`,
);

const home = await get("/");
const homeText = visibleText(home.body);
check("homepage HTTP 200", home.status === 200, `status ${home.status}`);
check("homepage has H1", /<h1[\s>]/i.test(home.body));
check(
  "homepage H1 names Vishal Kumar of vishalk.com",
  /<h1[^>]*>\s*Vishal Kumar of vishalk\.com\s*<\/h1>/i.test(home.body),
);
check("homepage 500+ chars without JS", homeText.length >= 500, `${homeText.length} chars`);
const homeTitle = home.body.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim() ?? "";
check(
  "homepage title names Vishal Kumar and vishalk.com",
  /Vishal Kumar/i.test(homeTitle) && /vishalk\.com/i.test(homeTitle),
  homeTitle || "(missing)",
);
const homeHead = home.body.split(/<\/head>/i)[0] ?? "";
check(
  "head rel=me LinkedIn and GitHub",
  /rel="me"/i.test(homeHead) &&
    homeHead.includes("linkedin.com/in/vishalkdotcom") &&
    homeHead.includes("github.com/vishalkdotcom"),
);
check(
  "og:site_name is vishalk.com",
  /property="og:site_name"[^>]*content="vishalk\.com"/i.test(homeHead) ||
    /content="vishalk\.com"[^>]*property="og:site_name"/i.test(homeHead),
);
const homeDescription =
  homeHead.match(/name="description"[^>]*content="([^"]*)"/i)?.[1] ??
  homeHead.match(/content="([^"]*)"[^>]*name="description"/i)?.[1] ??
  "";
check(
  "homepage description names Vishal Kumar of vishalk.com",
  /Vishal Kumar of vishalk\.com/i.test(homeDescription),
  homeDescription.slice(0, 96) || "(missing)",
);
check(
  "homepage Person JSON-LD",
  home.body.includes('"@type":"Person"') || home.body.includes('"@type": "Person"'),
);
check(
  "homepage Organization JSON-LD",
  home.body.includes('"@type":"Organization"') || home.body.includes('"@type": "Organization"'),
);
check(
  "homepage WebSite JSON-LD",
  home.body.includes('"@type":"WebSite"') || home.body.includes('"@type": "WebSite"'),
);
check(
  "homepage alternateName includes vishalk.com",
  /"alternateName":\s*\[/.test(home.body) && home.body.includes("vishalk.com"),
);
check(
  "JSON-LD site brand is vishalk.com",
  /"@type":\s*"WebSite"[\s\S]{0,200}"name":\s*"vishalk\.com"/.test(home.body) &&
    /"@type":\s*"Organization"[\s\S]{0,200}"name":\s*"vishalk\.com"/.test(home.body),
);
check(
  "Organization contactPoint + PostalAddress",
  /"@type":\s*"ContactPoint"/.test(home.body) && /"@type":\s*"PostalAddress"/.test(home.body),
);

for (const path of ["/about", "/contact"]) {
  const page = await get(path);
  const text = visibleText(page.body);
  check(`${path} HTTP 200`, page.status === 200, `status ${page.status}`);
  check(`${path} 500+ chars`, text.length >= 500, `${text.length} chars`);
}

const homeMd = await get("/", { headers: { Accept: "text/markdown" } });
check(
  "homepage Accept: text/markdown is 200",
  homeMd.status === 200 &&
    (homeMd.response.headers.get("content-type") ?? "").includes("text/markdown"),
  homeMd.response.headers.get("content-type") ?? `status ${homeMd.status}`,
);

const md = await get("/about", { headers: { Accept: "text/markdown" } });
const vary = md.response.headers.get("vary") ?? "";
check("Accept: text/markdown is 200", md.status === 200, `status ${md.status}`);
check(
  "markdown Content-Type",
  (md.response.headers.get("content-type") ?? "").includes("text/markdown"),
  md.response.headers.get("content-type") ?? "",
);
check(
  "Vary includes Accept",
  vary
    .split(",")
    .map((token) => token.trim().toLowerCase())
    .includes("accept"),
  vary || "(missing)",
);

const sibling = await get("/about.md");
check(
  "/about.md is markdown",
  sibling.status === 200 &&
    (sibling.response.headers.get("content-type") ?? "").includes("text/markdown"),
);

const sitemap = await get("/sitemap.xml");
check(
  "/sitemap.xml has lastmod",
  sitemap.status === 200 && sitemap.body.includes("<lastmod>") && sitemap.body.includes("<urlset"),
);

const llms = await get("/llms.txt");
check(
  "/llms.txt has when-to-use guidance",
  llms.status === 200 && /when to use this/i.test(llms.body),
);

const robots = await get("/robots.txt");
check("robots.txt HTTP 200", robots.status === 200, `status ${robots.status}`);
check(
  "robots.txt is not Cloudflare managed overlay",
  !/^# BEGIN Cloudflare Managed content/im.test(robots.body) &&
    !/Content-Signal:/i.test(robots.body),
);
for (const bot of BOTS) {
  const group = robots.body
    .split(/(?=user-agent:)/i)
    .find((chunk) => new RegExp(`^\\s*user-agent:\\s*${bot}\\b`, "i").test(chunk));
  const allows = Boolean(group && /allow:\s*\//i.test(group) && !/disallow:\s*\//i.test(group));
  check(`robots.txt allows ${bot}`, allows);
}

for (const bot of BOTS) {
  const probe = await get("/", { headers: { "User-Agent": BOT_UA[bot] } });
  const blocked = probe.status === 403 || /attention required/i.test(probe.body);
  check(`${bot} reaches origin`, probe.status === 200 && !blocked, `status ${probe.status}`);
}

if (failures.length > 0) {
  console.log(`\n${failures.length} failed`);
  process.exit(1);
}
console.log("\nall checks passed");
