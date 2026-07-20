import { render, screen, fireEvent, cleanup } from "@solidjs/testing-library";
import { createMemoryHistory, MemoryRouter } from "@solidjs/router";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { AppShellRoutes } from "./app";
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
