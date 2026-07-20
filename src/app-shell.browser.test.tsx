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
    await expect
      .element(screen.getByRole("main").getByRole("heading", { name: /^SupplyChain\+$/i }))
      .toBeVisible();
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
    await expect
      .element(screen.getByRole("main").getByRole("heading", { name: /^SupplyChain\+$/i }))
      .toBeVisible();
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

describe("Work Context Rail (App Shell seam)", () => {
  afterEach(() => cleanup());

  it("shows locked Work Context Rail section order when a Work Case is active", async () => {
    const { screen } = renderAt("/work/prototypes/supplychain-plus");
    const rail = screen.getByRole("complementary", { name: /context rail/i });
    await expect.element(rail).toBeVisible();

    await expect.element(rail.getByText(/^Availability$/i)).toBeVisible();
    await expect.element(rail.getByText(/^Live$/i)).toBeVisible();
    await expect.element(rail.getByText(/^Role$/i)).toBeVisible();
    await expect.element(rail.getByText(/^Outcomes$/i)).toBeVisible();
    await expect.element(rail.getByText(/^Stack$/i)).toBeVisible();
    await expect.element(rail.getByRole("link", { name: /get in touch/i })).toBeVisible();

    const text = rail.element().textContent ?? "";
    const markers = ["Availability", "Live", "Role", "Outcomes", "Stack", "Get in touch"];
    let previous = -1;
    for (const marker of markers) {
      const index = text.indexOf(marker);
      expect(index, `expected "${marker}" after prior sections`).toBeGreaterThan(previous);
      previous = index;
    }
  });

  it("keeps Stack expanded without a collapse control", async () => {
    const { screen } = renderAt("/work/labor-solutions/engage-reporting");
    const rail = screen.getByRole("complementary", { name: /context rail/i });
    await expect.element(rail).toBeVisible();
    await expect.element(rail.getByText(/^Stack$/i)).toBeVisible();
    await expect.element(rail.getByText(/Reporting UI/i)).toBeVisible();
    await expect.element(rail.getByRole("button", { name: /stack/i })).not.toBeInTheDocument();
  });

  it("updates Context Rail body when the active Work Case changes", async () => {
    const { history, screen } = renderAt("/work/labor-solutions/engage-reporting");
    const rail = screen.getByRole("complementary", { name: /context rail/i });
    await expect.element(rail).toBeVisible();
    await expect.element(rail).toHaveTextContent(/Engage reporting/i);
    await expect.element(rail).toHaveTextContent(/Auth-walled/i);

    await screen.getByRole("link", { name: /SupplyChain\+/i }).click();
    expect(history.get()).toBe("/work/prototypes/supplychain-plus");
    await expect.element(rail).toHaveTextContent(/SupplyChain\+/i);
    await expect.element(rail).toHaveTextContent(/sc-plus\.vercel\.app/i);
    await expect.element(rail).not.toHaveTextContent(/Engage reporting/i);
  });

  it("keeps Context Rail in the Triptych Dock collapse model", async () => {
    const { screen } = renderAt("/work/tools/snap2paper");
    await expect
      .element(screen.getByRole("complementary", { name: /context rail/i }))
      .toBeVisible();
    await expect
      .element(screen.getByRole("complementary", { name: /context rail/i }))
      .toHaveTextContent(/Snap2Paper/i);

    await screen.getByRole("button", { name: /collapse (right|context)/i }).click();
    await expect
      .element(screen.getByRole("complementary", { name: /context rail/i }))
      .not.toBeInTheDocument();

    await screen.getByRole("button", { name: /expand (right|context)/i }).click();
    await expect
      .element(screen.getByRole("complementary", { name: /context rail/i }))
      .toBeVisible();
    await expect
      .element(screen.getByRole("complementary", { name: /context rail/i }))
      .toHaveTextContent(/Snap2Paper/i);
  });

  it("omits Outputs and Sources product labels from the Context Rail", async () => {
    const { screen } = renderAt("/work/prototypes/qgenai");
    const rail = screen.getByRole("complementary", { name: /context rail/i });
    await expect.element(rail).toBeVisible();
    await expect.element(rail.getByText(/^Outputs$/i)).not.toBeInTheDocument();
    await expect.element(rail.getByText(/^Sources$/i)).not.toBeInTheDocument();
  });
});

describe("Featured Public Storefront SupplyChain+ (App Shell seam)", () => {
  afterEach(() => cleanup());

  it("cold-loads / as SupplyChain+ Public Storefront, not About hub", async () => {
    const { screen } = renderAt("/");
    const stage = screen.getByRole("main");
    await expect.element(stage.getByRole("heading", { name: /^SupplyChain\+$/i })).toBeVisible();
    await expect.element(stage.getByText(/^Prototype$/i)).toBeVisible();
    await expect.element(stage).not.toHaveTextContent(/About Mode/i);
    await expect.element(stage).not.toHaveTextContent(/Featured Public Storefront \(stub\)/i);
    await expect.element(stage).not.toHaveTextContent(/Vishal Kumar/i);
  });

  it("keeps center proof-first with outcomes above media", async () => {
    const { screen } = renderAt("/");
    const stage = screen.getByRole("main");
    await expect.element(stage.getByRole("heading", { name: /^SupplyChain\+$/i })).toBeVisible();

    const text = stage.element().textContent ?? "";
    const outcomesIndex = text.search(/explainable supplier-risk scoring/i);
    const mediaIndex = text.search(/Shot 1/i);
    expect(outcomesIndex).toBeGreaterThan(-1);
    expect(mediaIndex).toBeGreaterThan(outcomesIndex);
  });

  it("shows Prototype badge and Live pointing at the honest public URL", async () => {
    const { screen } = renderAt("/");
    const stage = screen.getByRole("main");
    const rail = screen.getByRole("complementary", { name: /context rail/i });

    await expect.element(stage.getByText(/^Prototype$/i)).toBeVisible();
    await expect.element(rail.getByRole("link", { name: /sc-plus\.vercel\.app/i })).toBeVisible();
    expect(
      rail
        .getByRole("link", { name: /sc-plus\.vercel\.app/i })
        .element()
        .getAttribute("href"),
    ).toBe("https://sc-plus.vercel.app");
  });

  it("binds Context Rail Live/Role/Outcomes/Stack to SupplyChain+ on /", async () => {
    const { screen } = renderAt("/");
    const rail = screen.getByRole("complementary", { name: /context rail/i });
    await expect.element(rail).toBeVisible();
    await expect.element(rail.getByText(/^Live$/i)).toBeVisible();
    await expect.element(rail.getByText(/^Role$/i)).toBeVisible();
    await expect.element(rail.getByText(/^Outcomes$/i)).toBeVisible();
    await expect.element(rail.getByText(/^Stack$/i)).toBeVisible();
    await expect.element(rail).toHaveTextContent(/SupplyChain\+/i);
    await expect.element(rail).toHaveTextContent(/Next\.js/i);
    await expect.element(rail).not.toHaveTextContent(/Context follows the active Mode/i);
  });

  it("surfaces only Public Claims in center and rail copy", async () => {
    const { screen } = renderAt("/");
    const stage = screen.getByRole("main");
    const rail = screen.getByRole("complementary", { name: /context rail/i });

    await expect.element(stage).toHaveTextContent(/not a production launch/i);
    await expect.element(rail).toHaveTextContent(/not a production launch/i);
    await expect.element(stage).not.toHaveTextContent(/206 authored commits/i);
    await expect.element(rail).not.toHaveTextContent(/206 authored commits/i);
    await expect.element(stage).not.toHaveTextContent(/300 factories/i);
    await expect.element(rail).not.toHaveTextContent(/300 factories/i);
    await expect.element(stage).not.toHaveTextContent(/\(stub\)/i);
    await expect.element(rail).not.toHaveTextContent(/\(stub\)/i);
  });

  it("deep-links SupplyChain+ with the same proof-first Public Storefront", async () => {
    const { screen } = renderAt("/work/prototypes/supplychain-plus");
    const stage = screen.getByRole("main");
    await expect.element(stage.getByRole("heading", { name: /^SupplyChain\+$/i })).toBeVisible();
    await expect.element(stage.getByText(/^Prototype$/i)).toBeVisible();
    await expect.element(stage.getByRole("region", { name: /case media/i })).toBeVisible();
    await expect
      .element(screen.getByRole("complementary", { name: /context rail/i }))
      .toHaveTextContent(/sc-plus\.vercel\.app/i);
  });
});

describe("Public Storefront carousel and Preview (App Shell seam)", () => {
  afterEach(() => cleanup());

  it("uses a stage carousel for Public Storefront media by default", async () => {
    const { screen } = renderAt("/");
    const stage = screen.getByRole("main");
    const carousel = stage.getByRole("region", { name: /case media/i });

    await expect.element(carousel).toBeVisible();
    await expect.element(carousel).toHaveTextContent(/Shot 1/i);
    await expect.element(stage).not.toHaveTextContent(/media placeholder/i);

    await carousel.getByRole("button", { name: /next/i }).click();
    await expect.element(carousel).toHaveTextContent(/Shot 2/i);
  });

  it("opens a Preview slide-over with Desktop/Mobile frames from the header chip", async () => {
    const { screen } = renderAt("/");

    const previewChip = screen.getByRole("button", { name: /^Preview$/i });
    await expect.element(previewChip).toBeVisible();
    expect(previewChip.element().hasAttribute("disabled")).toBe(false);

    await previewChip.click();
    const dialog = screen.getByRole("dialog", { name: /^Preview$/i });
    await expect.element(dialog).toBeVisible();
    await expect.element(dialog.getByRole("button", { name: /^Desktop$/i })).toBeVisible();
    await expect.element(dialog.getByRole("button", { name: /^Mobile$/i })).toBeVisible();
    await expect.element(dialog).toHaveTextContent(/sc-plus\.vercel\.app/i);

    await dialog.getByRole("button", { name: /^Mobile$/i }).click();
    await expect.element(dialog).toHaveTextContent(/mobile/i);
  });

  it("keeps Preview disabled on Internal Dossier Work Cases", async () => {
    const { screen } = renderAt("/work/labor-solutions/engage-reporting");

    const previewChip = screen.getByRole("button", { name: /^Preview$/i });
    await expect.element(previewChip).toBeVisible();
    expect(previewChip.element().hasAttribute("disabled")).toBe(true);

    await expect
      .element(screen.getByRole("dialog", { name: /^Preview$/i }))
      .not.toBeInTheDocument();
  });

  it("keeps Preview disabled when Public Storefront Live is still a stub", async () => {
    const { screen } = renderAt("/work/prototypes/qgenai");
    const previewChip = screen.getByRole("button", { name: /^Preview$/i });
    await expect.element(previewChip).toBeVisible();
    expect(previewChip.element().hasAttribute("disabled")).toBe(true);
  });

  it("closes Preview without losing the active Work Case", async () => {
    const { history, screen } = renderAt("/work/prototypes/supplychain-plus");

    await screen.getByRole("button", { name: /^Preview$/i }).click();
    const dialog = screen.getByRole("dialog", { name: /^Preview$/i });
    await expect.element(dialog).toBeVisible();

    await dialog.getByRole("button", { name: /close preview/i }).click();
    await expect
      .element(screen.getByRole("dialog", { name: /^Preview$/i }))
      .not.toBeInTheDocument();
    expect(history.get()).toBe("/work/prototypes/supplychain-plus");
    await expect
      .element(screen.getByRole("main").getByRole("heading", { name: /^SupplyChain\+$/i }))
      .toBeVisible();
  });
});
