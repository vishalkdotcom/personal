/** Google Analytics (gtag) — Vite env + SPA page views. */

export type GtagWindow = {
  dataLayer: unknown[];
  gtag?: (...args: unknown[]) => void;
};

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

const envRaw = import.meta.env.VITE_GOOGLE_ANALYTICS_ID as string | undefined;

const bootstrappedIds = new Set<string>();

/** Blank / unset → analytics off. */
export function resolveGoogleAnalyticsId(raw: string | undefined): string | undefined {
  const trimmed = raw?.trim();
  return trimmed ? trimmed : undefined;
}

/** Measurement ID from `VITE_GOOGLE_ANALYTICS_ID`. */
export function googleAnalyticsId(): string | undefined {
  return resolveGoogleAnalyticsId(envRaw);
}

export function gtagScriptSrc(gaId: string): string {
  return `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
}

/**
 * Installs `gtag` on `win` and configures the measurement ID with automatic
 * page_view disabled (SPA owns page views via {@link trackPageView}).
 * Idempotent per measurement ID.
 */
export function initGtag(win: GtagWindow, gaId: string): void {
  if (bootstrappedIds.has(gaId)) return;

  win.dataLayer = win.dataLayer ?? [];
  if (typeof win.gtag !== "function") {
    // Match the official/Svelte snippet: push the Arguments object, not a rest array.
    win.gtag = function gtag(this: void) {
      // eslint-disable-next-line prefer-rest-params -- GA dataLayer contract
      win.dataLayer.push(arguments);
    };
  }

  win.gtag("js", new Date());
  win.gtag("config", gaId, { send_page_view: false });
  bootstrappedIds.add(gaId);
}

/** @internal Vitest — clear idempotency set between tests. */
export function resetGoogleAnalyticsBootstrapForTests(): void {
  bootstrappedIds.clear();
}

/** Sends a GA4 `page_view` for the current SPA route (full `page_location` URL). */
export function trackPageView(gaId: string, page: { pagePath: string; pageTitle: string }): void {
  const gtag = typeof window !== "undefined" ? window.gtag : undefined;
  if (typeof gtag !== "function") return;

  const origin = window.location?.origin ?? "";
  gtag("event", "page_view", {
    send_to: gaId,
    page_title: page.pageTitle,
    page_location: `${origin}${page.pagePath}`,
  });
}

/**
 * Ensures gtag is initialized and the remote script is in `document.head`.
 * Safe to call on every navigation; script tag is inserted once per ID.
 */
export function ensureGoogleAnalytics(gaId: string): void {
  initGtag(window, gaId);

  const src = gtagScriptSrc(gaId);
  if (document.querySelector(`script[src="${src}"]`)) return;

  const script = document.createElement("script");
  script.async = true;
  script.src = src;
  document.head.appendChild(script);
}
