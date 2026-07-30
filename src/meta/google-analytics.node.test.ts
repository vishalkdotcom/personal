import { afterEach, describe, expect, it, vi } from "vitest";
import {
  gtagScriptSrc,
  initGtag,
  resetGoogleAnalyticsBootstrapForTests,
  resolveGoogleAnalyticsId,
  trackPageView,
  type GtagWindow,
} from "./google-analytics";

describe("resolveGoogleAnalyticsId", () => {
  it("returns a trimmed measurement ID when set", () => {
    expect(resolveGoogleAnalyticsId("G-ABCDEF1234")).toBe("G-ABCDEF1234");
    expect(resolveGoogleAnalyticsId("  G-ABCDEF1234  ")).toBe("G-ABCDEF1234");
  });

  it("disables analytics when unset or blank", () => {
    expect(resolveGoogleAnalyticsId(undefined)).toBeUndefined();
    expect(resolveGoogleAnalyticsId("")).toBeUndefined();
    expect(resolveGoogleAnalyticsId("   ")).toBeUndefined();
  });
});

describe("gtagScriptSrc", () => {
  it("points at googletagmanager with the measurement ID", () => {
    expect(gtagScriptSrc("G-ABCDEF1234")).toBe(
      "https://www.googletagmanager.com/gtag/js?id=G-ABCDEF1234",
    );
  });
});

describe("initGtag", () => {
  afterEach(() => {
    resetGoogleAnalyticsBootstrapForTests();
  });

  it("boots dataLayer and configures with send_page_view false", () => {
    const dataLayer: unknown[] = [];
    const win = { dataLayer } as GtagWindow;

    initGtag(win, "G-ABCDEF1234");

    expect(typeof win.gtag).toBe("function");
    expect(dataLayer.length).toBeGreaterThanOrEqual(2);
    const configEntry = dataLayer.find((entry) => {
      const row = entry as ArrayLike<unknown>;
      return row[0] === "config" && row[1] === "G-ABCDEF1234";
    }) as ArrayLike<unknown> | undefined;
    expect(configEntry?.[2]).toEqual({ send_page_view: false });
  });

  it("is idempotent for the same measurement ID", () => {
    const dataLayer: unknown[] = [];
    const win = { dataLayer } as GtagWindow;

    initGtag(win, "G-ABCDEF1234");
    const afterFirst = dataLayer.length;
    initGtag(win, "G-ABCDEF1234");
    expect(dataLayer.length).toBe(afterFirst);
  });
});

describe("trackPageView", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("sends gtag config with page_path and page_title", () => {
    const gtag = vi.fn();
    vi.stubGlobal("window", { gtag });

    trackPageView("G-ABCDEF1234", {
      pagePath: "/work?x=1",
      pageTitle: "Work · Vishal Kumar",
    });

    expect(gtag).toHaveBeenCalledWith("config", "G-ABCDEF1234", {
      page_path: "/work?x=1",
      page_title: "Work · Vishal Kumar",
    });
  });

  it("no-ops when gtag is not a function", () => {
    vi.stubGlobal("window", {});
    expect(() => trackPageView("G-ABCDEF1234", { pagePath: "/", pageTitle: "Home" })).not.toThrow();
  });
});
