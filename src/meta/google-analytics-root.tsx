import { useLocation } from "@solidjs/router";
import { createEffect } from "solid-js";
import { ensureGoogleAnalytics, googleAnalyticsId, trackPageView } from "./google-analytics";
import { pageMetaForPath } from "./route-manifest";

/**
 * Loads gtag when `VITE_GOOGLE_ANALYTICS_ID` is set and sends SPA `page_view`
 * events on pathname/search changes.
 */
export function GoogleAnalytics() {
  const location = useLocation();
  const gaId = googleAnalyticsId();

  createEffect(
    () => ({
      pagePath: `${location.pathname}${location.search}`,
      pageTitle: pageMetaForPath(location.pathname).title,
    }),
    (page) => {
      if (!gaId) return;
      ensureGoogleAnalytics(gaId);
      trackPageView(gaId, page);
    },
  );

  return null;
}
