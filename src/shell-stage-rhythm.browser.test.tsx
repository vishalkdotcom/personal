import { cleanup, render } from "@solidjs/testing-library";
import { createMemoryHistory, MemoryRouter } from "@solidjs/router";
import { afterEach, describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import { AppShellRoutes } from "./app";
import { RAIL_MODULE_CLASS } from "./shell/rail-module";
import { setHireSignalEnabledForTests } from "./shell/hire-signal";
import { STAGE_SHELL_DESKTOP_CLASS } from "./shell/stage-shell";
import { STAGE_TITLE_CLASS, STAGE_TITLE_LG_CLASS } from "./shell/stage-title";
import { workCaseHref } from "./work/inventory";

const SUPPLY_CHAIN_PATH = workCaseHref("prototypes", "supplychain-plus");

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

function railModules(rail: Element): Element[] {
  return [...rail.querySelectorAll(":scope > [data-rail-stack] > section[data-rail-module]")];
}

function stageTitle(stage: Element, name: RegExp): Element {
  const heading = [...stage.querySelectorAll("h1")].find((el) => name.test(el.textContent ?? ""));
  expect(heading, `expected stage h1 matching ${name}`).toBeTruthy();
  return heading!;
}

function hasAllClasses(el: Element, classString: string): boolean {
  return classString.split(/\s+/).every((token) => el.classList.contains(token));
}

describe("Context Rail panels and stage rhythm (App Shell seam)", () => {
  afterEach(() => {
    cleanup();
    setHireSignalEnabledForTests(undefined);
  });

  it("renders Context Rail sections as bordered discrete modules across Modes and Work Cases", async () => {
    setHireSignalEnabledForTests(true);

    for (const path of [SUPPLY_CHAIN_PATH, "/", "/resume", "/contact"] as const) {
      const { screen, unmount } = renderAt(path);
      const rail = screen.getByRole("complementary", { name: /^details$/i });
      await expect.element(rail).toBeVisible();

      await expect.element(rail.getByRole("heading", { name: /^Open to roles$/i })).toBeVisible();
      const hire = rail.element().querySelector("#rail-hire-signal")?.closest("section");
      expect(hire, `expected soft Hire Signal panel on ${path}`).toBeTruthy();
      expect(hire!.hasAttribute("data-rail-module")).toBe(false);
      expect(hire!.className).toMatch(/bg-accent-soft/);

      const modules = railModules(rail.element());
      // /resume + /contact are soft hire panel + one links module; others keep ≥2 bordered modules.
      const minModules = path === "/resume" || path === "/contact" ? 1 : 2;
      expect(modules.length, `expected rail modules on ${path}`).toBeGreaterThanOrEqual(minModules);
      for (const mod of modules) {
        expect(hasAllClasses(mod, RAIL_MODULE_CLASS)).toBe(true);
      }
      unmount();
      cleanup();
    }
  });

  it("marks primary About / Work Case / Contact stage headings with locked title scale classes", async () => {
    {
      const { screen, unmount } = renderAt("/");
      const title = stageTitle(screen.getByRole("main").element(), /^Vishal Kumar$/i);
      expect(hasAllClasses(title, STAGE_TITLE_CLASS)).toBe(true);
      expect(hasAllClasses(title, STAGE_TITLE_LG_CLASS)).toBe(true);
      unmount();
      cleanup();
    }
    {
      const { screen, unmount } = renderAt(SUPPLY_CHAIN_PATH);
      const title = stageTitle(screen.getByRole("main").element(), /^SupplyChain\+$/i);
      expect(hasAllClasses(title, STAGE_TITLE_CLASS)).toBe(true);
      unmount();
      cleanup();
    }
    {
      const { screen } = renderAt("/contact");
      const title = stageTitle(screen.getByRole("main").element(), /^Get in touch$/i);
      expect(hasAllClasses(title, STAGE_TITLE_CLASS)).toBe(true);
    }
  });

  it("marks the desktop stage with the generous rhythm surface utilities", async () => {
    const { screen } = renderAt("/");
    const stage = screen.getByRole("main").element();
    expect(stage.getAttribute("data-stage")).toBe("desktop");
    expect(hasAllClasses(stage, STAGE_SHELL_DESKTOP_CLASS)).toBe(true);
  });

  it("bleeds the Resume Surface against the locked stage padding tokens", async () => {
    const { screen } = renderAt("/resume");
    const stage = screen.getByRole("main").element();
    const surface = stage.querySelector("[data-stage-bleed]");
    expect(surface).toBeTruthy();
    expect(stage.contains(surface)).toBe(true);
    expect(stage.getAttribute("data-stage")).toBe("desktop");
  });
});
