/** User-Agent tokens Is Agentic and this site treat as allowed AI crawlers. */
export const AI_CRAWLER_UA_TOKENS = [
  "GPTBot",
  "ChatGPT-User",
  "ClaudeBot",
  "PerplexityBot",
  "Google-Extended",
  "DeepSeekBot",
] as const;

export type AiCrawlerUaToken = (typeof AI_CRAWLER_UA_TOKENS)[number];

export const WAF_SKIP_DESCRIPTION = "Allow AI crawlers (agent-readiness)";

const BOT_MANAGEMENT_READONLY_KEYS = ["stale_zone_configuration", "using_latest_model"] as const;

/** Zone Bot Management fields that let origin robots.txt and AI crawlers through. */
export const BOT_MANAGEMENT_ALLOWLIST = {
  ai_bots_protection: "disabled",
  is_robots_txt_managed: false,
  cf_robots_variant: "off",
  crawler_protection: "disabled",
} as const;

export type BotManagementConfig = Record<string, unknown>;

export function withoutReadonlyBotFields(config: BotManagementConfig): BotManagementConfig {
  const next: BotManagementConfig = { ...config };
  for (const key of BOT_MANAGEMENT_READONLY_KEYS) {
    delete next[key];
  }
  return next;
}

/** Overlay for PUT /bot_management. `full` also turns off Content Signals + the AI link maze. */
export function botManagementAllowlistPatch(
  current: BotManagementConfig,
  variant: "full" | "minimal" = "full",
): BotManagementConfig {
  const rest = withoutReadonlyBotFields(current);
  if (variant === "minimal") {
    return {
      ...rest,
      ai_bots_protection: BOT_MANAGEMENT_ALLOWLIST.ai_bots_protection,
      is_robots_txt_managed: BOT_MANAGEMENT_ALLOWLIST.is_robots_txt_managed,
    };
  }
  return { ...rest, ...BOT_MANAGEMENT_ALLOWLIST };
}

const WAF_SKIP_PRODUCTS = ["uaBlock", "bic", "securityLevel", "waf"] as const;
const WAF_SKIP_PHASES = ["http_request_sbfm"] as const;

export type WafSkipVariant = "full" | "minimal";

/**
 * Skip remaining custom WAF rules (AI Crawl Control blocks), Super Bot Fight Mode,
 * and the listed products for matching user-agents. `minimal` omits `ruleset`
 * for plans that reject skip-remaining-custom-rules.
 */
export function wafSkipActionParameters(variant: WafSkipVariant = "full"): {
  ruleset?: "current";
  phases: typeof WAF_SKIP_PHASES;
  products: typeof WAF_SKIP_PRODUCTS;
} {
  const parameters = {
    phases: WAF_SKIP_PHASES,
    products: WAF_SKIP_PRODUCTS,
  };
  if (variant === "minimal") return parameters;
  return { ruleset: "current", ...parameters };
}

export function wafSkipRule(variant: WafSkipVariant = "full") {
  return {
    description: WAF_SKIP_DESCRIPTION,
    expression: wafSkipExpression(),
    action: "skip" as const,
    action_parameters: wafSkipActionParameters(variant),
    enabled: true,
  };
}

/** Cloudflare custom-rule expression: skip Bot Fight for these UAs. */
export function wafSkipExpression(tokens: readonly string[] = AI_CRAWLER_UA_TOKENS): string {
  return tokens.map((token) => `(http.user_agent contains "${token}")`).join(" or ");
}
