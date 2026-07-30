import { cleanup, render } from "@solidjs/testing-library";
import { createMemoryHistory, MemoryRouter } from "@solidjs/router";
import { afterEach, describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import { AppShellRoutes } from "../app";
import { getWorkCase } from "../work/inventory";
import { SITE_ORIGIN } from "./site";

function renderAt(path: string) {
  const history = createMemoryHistory();
  history.set({ value: path, replace: true, scroll: false });
  const result = render(() => (
    <MemoryRouter history={history} root={AppShellRoutes.root}>
      {AppShellRoutes.routes}
    </MemoryRouter>
  ));
  return { ...result, history, screen: page.elementLocator(result.baseElement) };
}

function metaContent(selector: string): string | null {
  return document.head.querySelector(selector)?.getAttribute("content") ?? null;
}

function canonicalHref(): string | null {
  return document.head.querySelector('link[rel="canonical"]')?.getAttribute("href") ?? null;
}

/** App-owned title — Vitest Browser Mode keeps its own harness `<title>` first. */
function appDocumentTitle(): string | null {
  const titles = [...document.head.querySelectorAll("title")];
  const owned = titles.find((el) => el.textContent?.includes("· Vishal Kumar"));
  return owned?.textContent ?? titles.at(-1)?.textContent ?? null;
}

describe("Document head meta sync (App Shell seam)", () => {
  afterEach(() => cleanup());

  it("sets title, description, OG, and canonical when mounting Mode and Work Case URLs", async () => {
    const { screen: aboutScreen } = renderAt("/");
    await expect
      .element(aboutScreen.getByRole("main").getByRole("heading", { name: /^Vishal Kumar$/i }))
      .toBeVisible();
    expect(appDocumentTitle()).toBe("About · Vishal Kumar");
    expect(metaContent('meta[name="description"]')).toContain("React/Next.js product UI");
    expect(metaContent('meta[name="description"]')).not.toMatch(
      /Complex product UI|complex React/i,
    );
    expect(metaContent('meta[property="og:title"]')).toBe("About · Vishal Kumar");
    expect(metaContent('meta[property="og:image"]')).toBe(`${SITE_ORIGIN}/og.png`);
    expect(metaContent('meta[name="twitter:card"]')).toBe("summary_large_image");
    expect(canonicalHref()).toBe(`${SITE_ORIGIN}/`);
    cleanup();

    const { screen: contactScreen } = renderAt("/contact");
    await expect
      .element(contactScreen.getByRole("main").getByRole("heading", { name: /^Get in touch$/i }))
      .toBeVisible();
    expect(appDocumentTitle()).toBe("Contact · Vishal Kumar");
    expect(canonicalHref()).toBe(`${SITE_ORIGIN}/contact`);
    cleanup();

    const { screen: resumeScreen } = renderAt("/resume");
    await expect
      .element(resumeScreen.getByRole("main").getByTitle(/Vishal Kumar resume/i))
      .toBeVisible();
    expect(appDocumentTitle()).toBe("Resume · Vishal Kumar");
    expect(canonicalHref()).toBe(`${SITE_ORIGIN}/resume`);
    cleanup();

    const { screen: caseScreen } = renderAt("/work/labor-solutions/engage-reporting");
    await expect
      .element(caseScreen.getByRole("main").getByRole("heading", { name: /^Engage reporting$/i }))
      .toBeVisible();
    expect(appDocumentTitle()).toBe("Engage reporting · Vishal Kumar");
    const engageLede = getWorkCase("labor-solutions", "engage-reporting")?.lede;
    expect(engageLede).toBeTruthy();
    expect(metaContent('meta[name="description"]')).toBe(engageLede);
    expect(canonicalHref()).toBe(`${SITE_ORIGIN}/work/labor-solutions/engage-reporting`);
  });

  it("keeps head in sync via @solidjs/meta when navigating between Modes", async () => {
    const { history, screen } = renderAt("/");

    await expect
      .element(screen.getByRole("main").getByRole("heading", { name: /^Vishal Kumar$/i }))
      .toBeVisible();
    expect(appDocumentTitle()).toBe("About · Vishal Kumar");
    expect(canonicalHref()).toBe(`${SITE_ORIGIN}/`);

    await screen.getByRole("link", { name: /^Work$/i }).click();
    await expect
      .element(screen.getByRole("main").getByRole("heading", { name: /^All work$/i }))
      .toBeVisible();
    expect(history.get()).toBe("/work");
    expect(appDocumentTitle()).toBe("Work · Vishal Kumar");
    expect(canonicalHref()).toBe(`${SITE_ORIGIN}/work`);

    await screen.getByRole("link", { name: /^Contact$/i }).click();
    await expect
      .element(screen.getByRole("main").getByRole("heading", { name: /^Get in touch$/i }))
      .toBeVisible();
    expect(history.get()).toBe("/contact");
    expect(appDocumentTitle()).toBe("Contact · Vishal Kumar");
    expect(canonicalHref()).toBe(`${SITE_ORIGIN}/contact`);
  });
});
