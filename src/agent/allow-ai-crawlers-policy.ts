/**
 * What `scripts/allow-ai-crawlers.mjs` does when GitHub has (or lacks)
 * CLOUDFLARE_API_TOKEN.
 *
 * Main is not optional: missing token still fail-closes, but by verifying
 * live apex crawler reachability instead of refusing to run. Feature branches
 * skip so Quality stays green without hitting production.
 */
export type AllowAiCrawlersPlan = "apply" | "skip" | "verify-live";

export function allowAiCrawlersPlan(hasToken: boolean, optional: boolean): AllowAiCrawlersPlan {
  if (hasToken) return "apply";
  if (optional) return "skip";
  return "verify-live";
}
