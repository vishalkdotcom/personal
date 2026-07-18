import { render, screen, fireEvent, cleanup } from "@solidjs/testing-library";
import { createMemoryHistory, MemoryRouter } from "@solidjs/router";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { AppShellRoutes } from "./app";
import { THEME_STORAGE_KEY } from "./theme/theme";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function renderAt(path: string) {
  const history = createMemoryHistory();
  history.set({ value: path, replace: true, scroll: false });
  return render(() => (
    <MemoryRouter history={history} root={AppShellRoutes.root}>
      {AppShellRoutes.routes}
    </MemoryRouter>
  ));
}

describe("App Shell Mode routes (App Shell seam)", () => {
  afterEach(() => cleanup());

  it("shows labeled stub stages for each Mode URL", async () => {
    const cases: Array<[string, string | RegExp]> = [
      ["/", /Featured Public Storefront/i],
      ["/about", /About Mode/i],
      ["/resume", /Resume Surface/i],
      ["/contact", /Contact Mode/i],
      ["/work/labor-solutions", /Work Folder/i],
      [
        "/work/labor-solutions/engage-reporting",
        /Work Case/i,
      ],
    ];

    for (const [path, label] of cases) {
      cleanup();
      renderAt(path);
      expect(await screen.findByText(label)).toBeInTheDocument();
    }
  });

  it("exposes brand-row theme control that cycles and persists preference", async () => {
    localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
    renderAt("/");

    const control = await screen.findByRole("button", { name: /theme/i });
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBeNull();

    fireEvent.click(control);
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("light");
    expect(document.documentElement.dataset.theme).toBe("light");

    fireEvent.click(control);
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
    expect(document.documentElement.dataset.theme).toBe("dark");

    fireEvent.click(control);
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("system");
  });
});

describe("FOUC-safe theme boot", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("ships an inline blocking script in index.html before stylesheet links", () => {
    const html = readFileSync(resolve(process.cwd(), "index.html"), "utf8");
    const scriptIdx = html.indexOf("vk-theme");
    const cssIdx = html.search(/rel=["']stylesheet["']/i);
    expect(scriptIdx).toBeGreaterThan(-1);
    expect(cssIdx).toBeGreaterThan(-1);
    expect(scriptIdx).toBeLessThan(cssIdx);
    expect(html).toMatch(/dataset\.theme|data-theme/);
  });
});
