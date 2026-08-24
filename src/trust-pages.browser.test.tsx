import { cleanup, render } from "@solidjs/testing-library";
import { createMemoryHistory, MemoryRouter } from "@solidjs/router";
import { afterEach, describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import { AppShellRoutes } from "./app";
import { PRIVACY_PARAGRAPHS } from "./privacy/content";

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

describe("Trust pages (App Shell seam)", () => {
  afterEach(() => cleanup());

  it("renders About Mode at /about without changing Mode nav href", async () => {
    const { screen } = renderAt("/about");
    await expect
      .element(screen.getByRole("main").getByRole("heading", { name: /^Vishal Kumar$/i }))
      .toBeVisible();
    const aboutNav = screen.getByRole("navigation", { name: /^Modes$/i }).getByRole("link", {
      name: /^About$/i,
    });
    await expect.element(aboutNav).toBeVisible();
    expect(aboutNav.element().getAttribute("href")).toBe("/");
    expect(aboutNav.element().getAttribute("aria-current")).toBe("page");
  });

  it("renders Privacy with the locked policy copy and a Contact link", async () => {
    const { screen, history } = renderAt("/privacy");
    await expect
      .element(screen.getByRole("main").getByRole("heading", { name: /^Privacy$/i }))
      .toBeVisible();
    await expect.element(screen.getByRole("main").getByText(PRIVACY_PARAGRAPHS[0]!)).toBeVisible();
    await screen
      .getByRole("main")
      .getByRole("link", { name: /^Contact$/i })
      .click();
    expect(history.get()).toBe("/contact");
  });

  it("links Privacy from the Contact form", async () => {
    const { screen, history } = renderAt("/contact");
    await expect
      .element(screen.getByRole("main").getByRole("heading", { name: /^Get in touch$/i }))
      .toBeVisible();
    await screen
      .getByRole("main")
      .getByRole("link", { name: /^Privacy$/i })
      .click();
    expect(history.get()).toBe("/privacy");
  });
});
