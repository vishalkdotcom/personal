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
  const result = render(() => (
    <MemoryRouter history={history} root={AppShellRoutes.root}>
      {AppShellRoutes.routes}
    </MemoryRouter>
  ));
  return { ...result, history };
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

describe("Desktop Triptych Dock (App Shell seam)", () => {
  afterEach(() => cleanup());

  it("shows always-on left IA, center stage, and Context Rail", async () => {
    renderAt("/");
    expect(await screen.findByRole("navigation", { name: /modes/i })).toBeInTheDocument();
    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(screen.getByRole("complementary", { name: /context rail/i })).toBeInTheDocument();
  });

  it("offers Work · About · Resume · Contact Modes without Notes", async () => {
    renderAt("/");
    const nav = await screen.findByRole("navigation", { name: /modes/i });
    expect(screen.getByRole("link", { name: /^Work$/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /^About$/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /^Resume$/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /^Contact$/i })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /^Notes$/i })).not.toBeInTheDocument();
    expect(nav.textContent).not.toMatch(/Notes/i);
  });

  it("updates URL and center stage when a Mode is selected", async () => {
    const { history } = renderAt("/");
    fireEvent.click(await screen.findByRole("link", { name: /^About$/i }));
    expect(await screen.findByText(/About Mode/i)).toBeInTheDocument();
    expect(history.get()).toBe("/about");

    fireEvent.click(screen.getByRole("link", { name: /^Resume$/i }));
    expect(await screen.findByText(/Resume Surface/i)).toBeInTheDocument();
    expect(history.get()).toBe("/resume");

    fireEvent.click(screen.getByRole("link", { name: /^Contact$/i }));
    expect(await screen.findByText(/Contact Mode/i)).toBeInTheDocument();
    expect(history.get()).toBe("/contact");

    fireEvent.click(screen.getByRole("link", { name: /^Work$/i }));
    expect(await screen.findByText(/Featured Public Storefront/i)).toBeInTheDocument();
    expect(history.get()).toBe("/");
  });

  it("collapses left and Context Rail via header chips; left stays an icon rail", async () => {
    renderAt("/about");

    const leftChip = await screen.findByRole("button", {
      name: /collapse left/i,
    });
    const rightChip = screen.getByRole("button", {
      name: /collapse (right|context)/i,
    });

    fireEvent.click(rightChip);
    expect(
      await screen.findByRole("button", { name: /expand (right|context)/i }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("complementary", { name: /context rail/i })).not.toBeInTheDocument();

    fireEvent.click(leftChip);
    expect(await screen.findByRole("button", { name: /expand left/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /^About$/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("link", { name: /^Contact$/i }));
    expect(await screen.findByText(/Contact Mode/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /expand (right|context)/i }));
    expect(await screen.findByRole("complementary", { name: /context rail/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /collapse (right|context)/i })).toBeInTheDocument();
  });

  it("omits chat/IDE product chrome labels", async () => {
    renderAt("/");
    await screen.findByRole("navigation", { name: /modes/i });
    expect(screen.queryByText(/composer/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/model picker/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/window menu/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/^Outputs$/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/^Sources$/i)).not.toBeInTheDocument();
  });
});

describe("Work inventory and Work tree (App Shell seam)", () => {
  afterEach(() => cleanup());

  it("shows locked Work Folders and Work Cases only", async () => {
    renderAt("/");
    const tree = await screen.findByRole("navigation", { name: /work tree/i });

    expect(tree).toHaveTextContent("Labor Solutions");
    expect(tree).toHaveTextContent("Advance Auto Parts");
    expect(tree).toHaveTextContent("Prototypes");
    expect(tree).toHaveTextContent("Tools");

    expect(screen.getByRole("link", { name: /Engage reporting/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Indicator Bank/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Measurement Framework/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Model Deployment Framework/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Store Dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /SupplyChain\+/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /QGenAI/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Snap2Paper/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /PhotoGrid/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /PDFGrid/i })).toBeInTheDocument();
  });

  it("omits locked-out Work Cases from the tree", async () => {
    renderAt("/");
    await screen.findByRole("navigation", { name: /work tree/i });

    for (const omitted of [
      "Auto-Bot",
      "JLGS",
      "Advance Assist",
      "DLS",
      "Auto Assist",
      "FYTV",
      "Zajj.music",
    ]) {
      expect(screen.queryByText(omitted)).not.toBeInTheDocument();
    }
  });

  it("shows Production or Prototype badges on locked cases", async () => {
    renderAt("/");
    await screen.findByRole("navigation", { name: /work tree/i });

    expect(screen.getByRole("link", { name: /Engage reporting.*Production/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Indicator Bank.*Production/i })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Measurement Framework.*Production/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Model Deployment Framework.*Production/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Store Dashboard.*Production/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /SupplyChain\+.*Prototype/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /QGenAI.*Prototype/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Snap2Paper.*Production/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /PhotoGrid.*Production/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /PDFGrid.*Production/i })).toBeInTheDocument();
  });

  it("updates URL and stage when a Work Folder or Work Case is selected", async () => {
    const { history } = renderAt("/");

    fireEvent.click(await screen.findByRole("link", { name: /^Labor Solutions$/i }));
    expect(await screen.findByText(/Work Folder · Labor Solutions/i)).toBeInTheDocument();
    expect(history.get()).toBe("/work/labor-solutions");

    fireEvent.click(screen.getByRole("link", { name: /Engage reporting/i }));
    expect(await screen.findByText(/Work Case · Engage reporting/i)).toBeInTheDocument();
    expect(history.get()).toBe("/work/labor-solutions/engage-reporting");

    fireEvent.click(screen.getByRole("link", { name: /SupplyChain\+/i }));
    expect(await screen.findByText(/Work Case · SupplyChain\+/i)).toBeInTheDocument();
    expect(history.get()).toBe("/work/prototypes/supplychain-plus");
  });

  it("collapses Work Cases under a folder group", async () => {
    renderAt("/");
    await screen.findByRole("navigation", { name: /work tree/i });

    expect(screen.getByRole("link", { name: /Engage reporting/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /collapse Labor Solutions/i }));
    expect(
      await screen.findByRole("button", { name: /expand Labor Solutions/i }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Engage reporting/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Indicator Bank/i })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /^Labor Solutions$/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /expand Labor Solutions/i }));
    expect(await screen.findByRole("link", { name: /Engage reporting/i })).toBeInTheDocument();
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
