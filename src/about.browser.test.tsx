import { cleanup, render } from "@solidjs/testing-library";
import { createMemoryHistory, MemoryRouter } from "@solidjs/router";
import { afterEach, describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import { AppShellRoutes } from "./app";

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

describe("Densified About Selected work (App Shell seam)", () => {
  afterEach(() => cleanup());

  for (const path of ["/", "/about"] as const) {
    it(`shows Selected work trio and All work on ${path}`, async () => {
      const { screen, history } = renderAt(path);
      const selected = screen.getByRole("main").getByRole("region", { name: /^Selected work$/i });

      await expect.element(selected).toBeVisible();
      const peeks = selected.getByRole("list", { name: /^Selected work$/i }).getByRole("listitem");
      await expect.poll(() => peeks.elements().length).toBe(3);

      for (const title of ["SupplyChain+", "Engage reporting", "Measurement Framework"]) {
        await expect
          .element(selected.getByRole("link", { name: new RegExp(title, "i") }))
          .toBeVisible();
      }
      await expect
        .element(selected.getByRole("link", { name: /^Indicator Bank$/i }))
        .not.toBeInTheDocument();

      await selected.getByRole("link", { name: /All work/i }).click();
      expect(history.get()).toBe("/work");
      await expect
        .element(screen.getByRole("main").getByRole("heading", { name: /^All work$/i }))
        .toBeVisible();
    });
  }
});
