import { cleanup, render } from "@solidjs/testing-library";
import { createMemoryHistory, MemoryRouter } from "@solidjs/router";
import { afterEach, describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import { AppShellRoutes } from "./app";
import { THEME_STORAGE_KEY } from "./theme/theme";

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

describe("App Shell Mode routes (App Shell seam)", () => {
  afterEach(() => cleanup());

  it("shows labeled stub stages for each Mode URL", async () => {
    const cases: Array<[string, string | RegExp]> = [
      ["/", /Featured Public Storefront/i],
      ["/about", /About Mode/i],
      ["/resume", /Resume Surface/i],
      ["/contact", /Contact Mode/i],
      ["/work/labor-solutions", /Work Folder/i],
      ["/work/labor-solutions/engage-reporting", /Work Case/i],
    ];

    for (const [path, label] of cases) {
      cleanup();
      const { screen } = renderAt(path);
      await expect.element(screen.getByText(label)).toBeVisible();
    }
  });

  it("exposes brand-row theme control that cycles and persists preference", async () => {
    localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
    const { screen } = renderAt("/");

    const control = screen.getByRole("button", { name: /theme/i });
    await expect.element(control).toBeVisible();
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBeNull();

    await control.click();
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("light");
    expect(document.documentElement.dataset.theme).toBe("light");
    await expect.element(screen.getByRole("button", { name: /Theme: Light/i })).toBeVisible();

    await control.click();
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
    expect(document.documentElement.dataset.theme).toBe("dark");
    await expect.element(screen.getByRole("button", { name: /Theme: Dark/i })).toBeVisible();

    await control.click();
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("system");
    await expect.element(screen.getByRole("button", { name: /Theme: System/i })).toBeVisible();
  });
});

describe("Desktop Triptych Dock (App Shell seam)", () => {
  afterEach(() => cleanup());

  it("shows always-on left IA, center stage, and Context Rail", async () => {
    const { screen } = renderAt("/");
    await expect.element(screen.getByRole("navigation", { name: /modes/i })).toBeVisible();
    await expect.element(screen.getByRole("main")).toBeVisible();
    await expect
      .element(screen.getByRole("complementary", { name: /context rail/i }))
      .toBeVisible();
  });

  it("offers Work · About · Resume · Contact Modes without Notes", async () => {
    const { screen } = renderAt("/");
    const nav = screen.getByRole("navigation", { name: /modes/i });
    await expect.element(nav).toBeVisible();
    await expect.element(screen.getByRole("link", { name: /^Work$/i })).toBeVisible();
    await expect.element(screen.getByRole("link", { name: /^About$/i })).toBeVisible();
    await expect.element(screen.getByRole("link", { name: /^Resume$/i })).toBeVisible();
    await expect.element(screen.getByRole("link", { name: /^Contact$/i })).toBeVisible();
    await expect.element(screen.getByRole("link", { name: /^Notes$/i })).not.toBeInTheDocument();
    await expect.element(nav).not.toHaveTextContent(/Notes/i);
  });

  it("updates URL and center stage when a Mode is selected", async () => {
    const { history, screen } = renderAt("/");

    await screen.getByRole("link", { name: /^About$/i }).click();
    await expect.element(screen.getByText(/About Mode/i)).toBeVisible();
    expect(history.get()).toBe("/about");

    await screen.getByRole("link", { name: /^Resume$/i }).click();
    await expect.element(screen.getByText(/Resume Surface/i)).toBeVisible();
    expect(history.get()).toBe("/resume");

    await screen.getByRole("link", { name: /^Contact$/i }).click();
    await expect.element(screen.getByText(/Contact Mode/i)).toBeVisible();
    expect(history.get()).toBe("/contact");

    await screen.getByRole("link", { name: /^Work$/i }).click();
    await expect.element(screen.getByText(/Featured Public Storefront/i)).toBeVisible();
    expect(history.get()).toBe("/");
  });

  it("collapses left and Context Rail via header chips; left stays an icon rail", async () => {
    const { screen } = renderAt("/about");

    const leftChip = screen.getByRole("button", { name: /collapse left/i });
    const rightChip = screen.getByRole("button", { name: /collapse (right|context)/i });
    await expect.element(leftChip).toBeVisible();
    await expect.element(rightChip).toBeVisible();

    await rightChip.click();
    await expect
      .element(screen.getByRole("button", { name: /expand (right|context)/i }))
      .toBeVisible();
    await expect
      .element(screen.getByRole("complementary", { name: /context rail/i }))
      .not.toBeInTheDocument();

    await leftChip.click();
    await expect.element(screen.getByRole("button", { name: /expand left/i })).toBeVisible();
    await expect.element(screen.getByRole("link", { name: /^About$/i })).toBeVisible();
    await screen.getByRole("link", { name: /^Contact$/i }).click();
    await expect.element(screen.getByText(/Contact Mode/i)).toBeVisible();

    await screen.getByRole("button", { name: /expand (right|context)/i }).click();
    await expect
      .element(screen.getByRole("complementary", { name: /context rail/i }))
      .toBeVisible();
    await expect
      .element(screen.getByRole("button", { name: /collapse (right|context)/i }))
      .toBeVisible();
  });

  it("omits chat/IDE product chrome labels", async () => {
    const { screen } = renderAt("/");
    await expect.element(screen.getByRole("navigation", { name: /modes/i })).toBeVisible();
    await expect.element(screen.getByText(/composer/i)).not.toBeInTheDocument();
    await expect.element(screen.getByText(/model picker/i)).not.toBeInTheDocument();
    await expect.element(screen.getByText(/window menu/i)).not.toBeInTheDocument();
    await expect.element(screen.getByText(/^Outputs$/i)).not.toBeInTheDocument();
    await expect.element(screen.getByText(/^Sources$/i)).not.toBeInTheDocument();
  });
});

describe("Work inventory and Work tree (App Shell seam)", () => {
  afterEach(() => cleanup());

  it("shows locked Work Folders and Work Cases only", async () => {
    const { screen } = renderAt("/");
    const tree = screen.getByRole("navigation", { name: /work tree/i });
    await expect.element(tree).toBeVisible();

    await expect.element(tree).toHaveTextContent("Labor Solutions");
    await expect.element(tree).toHaveTextContent("Advance Auto Parts");
    await expect.element(tree).toHaveTextContent("Prototypes");
    await expect.element(tree).toHaveTextContent("Tools");

    await expect.element(screen.getByRole("link", { name: /Engage reporting/i })).toBeVisible();
    await expect.element(screen.getByRole("link", { name: /Indicator Bank/i })).toBeVisible();
    await expect
      .element(screen.getByRole("link", { name: /Measurement Framework/i }))
      .toBeVisible();
    await expect
      .element(screen.getByRole("link", { name: /Model Deployment Framework/i }))
      .toBeVisible();
    await expect.element(screen.getByRole("link", { name: /Store Dashboard/i })).toBeVisible();
    await expect.element(screen.getByRole("link", { name: /SupplyChain\+/i })).toBeVisible();
    await expect.element(screen.getByRole("link", { name: /QGenAI/i })).toBeVisible();
    await expect.element(screen.getByRole("link", { name: /Snap2Paper/i })).toBeVisible();
    await expect.element(screen.getByRole("link", { name: /PhotoGrid/i })).toBeVisible();
    await expect.element(screen.getByRole("link", { name: /PDFGrid/i })).toBeVisible();
  });

  it("omits locked-out Work Cases from the tree", async () => {
    const { screen } = renderAt("/");
    await expect.element(screen.getByRole("navigation", { name: /work tree/i })).toBeVisible();

    for (const omitted of [
      "Auto-Bot",
      "JLGS",
      "Advance Assist",
      "DLS",
      "Auto Assist",
      "FYTV",
      "Zajj.music",
    ]) {
      await expect.element(screen.getByText(omitted)).not.toBeInTheDocument();
    }
  });

  it("shows Production or Prototype badges on locked cases", async () => {
    const { screen } = renderAt("/");
    await expect.element(screen.getByRole("navigation", { name: /work tree/i })).toBeVisible();

    await expect
      .element(screen.getByRole("link", { name: /Engage reporting.*Production/i }))
      .toBeVisible();
    await expect
      .element(screen.getByRole("link", { name: /Indicator Bank.*Production/i }))
      .toBeVisible();
    await expect
      .element(screen.getByRole("link", { name: /Measurement Framework.*Production/i }))
      .toBeVisible();
    await expect
      .element(screen.getByRole("link", { name: /Model Deployment Framework.*Production/i }))
      .toBeVisible();
    await expect
      .element(screen.getByRole("link", { name: /Store Dashboard.*Production/i }))
      .toBeVisible();
    await expect
      .element(screen.getByRole("link", { name: /SupplyChain\+.*Prototype/i }))
      .toBeVisible();
    await expect.element(screen.getByRole("link", { name: /QGenAI.*Prototype/i })).toBeVisible();
    await expect
      .element(screen.getByRole("link", { name: /Snap2Paper.*Production/i }))
      .toBeVisible();
    await expect
      .element(screen.getByRole("link", { name: /PhotoGrid.*Production/i }))
      .toBeVisible();
    await expect.element(screen.getByRole("link", { name: /PDFGrid.*Production/i })).toBeVisible();
  });

  it("updates URL and stage when a Work Folder or Work Case is selected", async () => {
    const { history, screen } = renderAt("/");

    await screen.getByRole("link", { name: /^Labor Solutions$/i }).click();
    await expect.element(screen.getByText(/Work Folder · Labor Solutions/i)).toBeVisible();
    expect(history.get()).toBe("/work/labor-solutions");

    await screen.getByRole("link", { name: /Engage reporting/i }).click();
    await expect.element(screen.getByText(/Work Case · Engage reporting/i)).toBeVisible();
    expect(history.get()).toBe("/work/labor-solutions/engage-reporting");

    await screen.getByRole("link", { name: /SupplyChain\+/i }).click();
    await expect.element(screen.getByText(/Work Case · SupplyChain\+/i)).toBeVisible();
    expect(history.get()).toBe("/work/prototypes/supplychain-plus");
  });

  it("collapses Work Cases under a folder group", async () => {
    const { screen } = renderAt("/");
    await expect.element(screen.getByRole("navigation", { name: /work tree/i })).toBeVisible();

    await expect.element(screen.getByRole("link", { name: /Engage reporting/i })).toBeVisible();

    await screen.getByRole("button", { name: /collapse Labor Solutions/i }).click();
    await expect
      .element(screen.getByRole("button", { name: /expand Labor Solutions/i }))
      .toBeVisible();
    await expect
      .element(screen.getByRole("link", { name: /Engage reporting/i }))
      .not.toBeInTheDocument();
    await expect
      .element(screen.getByRole("link", { name: /Indicator Bank/i }))
      .not.toBeInTheDocument();
    await expect.element(screen.getByRole("link", { name: /^Labor Solutions$/i })).toBeVisible();

    await screen.getByRole("button", { name: /expand Labor Solutions/i }).click();
    await expect.element(screen.getByRole("link", { name: /Engage reporting/i })).toBeVisible();
  });
});
