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

/** Cloudflare custom-rule expression: skip Bot Fight for these UAs. */
export function wafSkipExpression(tokens: readonly string[] = AI_CRAWLER_UA_TOKENS): string {
  return tokens.map((token) => `(http.user_agent contains "${token}")`).join(" or ");
}
