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
      ["/work/prototypes/qgenai", /Work Case/i],
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
    await expect
      .element(screen.getByRole("main").getByRole("heading", { name: /^Labor Solutions$/i }))
      .toBeVisible();
    expect(history.get()).toBe("/work/labor-solutions");

    await screen
      .getByRole("navigation", { name: /work tree/i })
      .getByRole("link", {
        name: /Engage reporting/i,
      })
      .click();
    await expect
      .element(screen.getByRole("main").getByRole("heading", { name: /^Engage reporting$/i }))
      .toBeVisible();
    expect(history.get()).toBe("/work/labor-solutions/engage-reporting");

    await screen
      .getByRole("navigation", { name: /work tree/i })
      .getByRole("link", {
        name: /SupplyChain\+/i,
      })
      .click();
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

describe("Work Folder dense outcome indexes (App Shell seam)", () => {
  afterEach(() => cleanup());

  it("shows a dense outcome list for a Work Folder URL", async () => {
    const { screen } = renderAt("/work/labor-solutions");
    const main = screen.getByRole("main");

    await expect.element(main.getByText(/^Work Folder$/i)).toBeVisible();
    await expect.element(main.getByRole("heading", { name: /^Labor Solutions$/i })).toBeVisible();
    await expect.element(main.getByRole("list", { name: /outcome index/i })).toBeVisible();
    await expect.element(main.getByRole("link", { name: /Engage reporting/i })).toBeVisible();
    await expect.element(main.getByRole("link", { name: /Indicator Bank/i })).toBeVisible();
    await expect.element(main.getByText(/dashboard vs Excel score drift/i)).toBeVisible();
    await expect.element(main.getByText(/four administration surfaces/i)).toBeVisible();
    await expect
      .element(main.getByRole("link", { name: /Engage reporting.*Production/i }))
      .toBeVisible();
    await expect
      .element(main.getByRole("link", { name: /Indicator Bank.*Production/i }))
      .toBeVisible();
    await expect
      .element(screen.getByText(/Work Folder · Labor Solutions \(stub\)/i))
      .not.toBeInTheDocument();
  });

  it("shows a dense outcome list for Advance Auto Parts Internal Dossiers", async () => {
    const { screen } = renderAt("/work/advance-auto-parts");
    const main = screen.getByRole("main");

    await expect
      .element(main.getByRole("heading", { name: /^Advance Auto Parts$/i }))
      .toBeVisible();
    await expect.element(main.getByRole("list", { name: /outcome index/i })).toBeVisible();
    await expect.element(main.getByText(/store KPI measurement UI/i)).toBeVisible();
    await expect.element(main.getByText(/self-service ML model hosting/i)).toBeVisible();
    await expect.element(main.getByText(/actual vs predicted/i)).toBeVisible();
    await expect
      .element(main.getByRole("link", { name: /Measurement Framework.*Production/i }))
      .toBeVisible();
    await expect
      .element(main.getByRole("link", { name: /Model Deployment Framework.*Production/i }))
      .toBeVisible();
    await expect
      .element(main.getByRole("link", { name: /Store Dashboard.*Production/i }))
      .toBeVisible();
  });

  it("shows a Work-root dense outcome list grouped by Work Folder", async () => {
    const { screen } = renderAt("/work");
    const main = screen.getByRole("main");

    await expect.element(main.getByRole("heading", { name: /^All work$/i })).toBeVisible();
    await expect.element(main.getByText(/^Labor Solutions$/i)).toBeVisible();
    await expect.element(main.getByText(/^Prototypes$/i)).toBeVisible();
    await expect.element(main.getByText(/^Tools$/i)).toBeVisible();
    await expect.element(main.getByRole("link", { name: /SupplyChain\+/i })).toBeVisible();
    await expect.element(main.getByRole("link", { name: /Snap2Paper/i })).toBeVisible();
  });

  it("offers All work in the Work tree and navigates to the Work-root index", async () => {
    const { history, screen } = renderAt("/");

    await screen
      .getByRole("navigation", { name: /work tree/i })
      .getByRole("link", {
        name: /^All work$/i,
      })
      .click();
    expect(history.get()).toBe("/work");
    await expect
      .element(screen.getByRole("main").getByRole("heading", { name: /^All work$/i }))
      .toBeVisible();
  });

  it("navigates to the Work Case URL when an index row is selected", async () => {
    const { history, screen } = renderAt("/work/labor-solutions");

    await screen
      .getByRole("main")
      .getByRole("link", { name: /Engage reporting/i })
      .click();
    expect(history.get()).toBe("/work/labor-solutions/engage-reporting");
    await expect
      .element(screen.getByRole("main").getByRole("heading", { name: /^Engage reporting$/i }))
      .toBeVisible();
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
    await expect.element(rail.getByText(/^Metabase Embedding SDK$/i)).toBeVisible();
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

describe("Internal Dossier Engage reporting (App Shell seam)", () => {
  afterEach(() => cleanup());

  it("deep-links Engage reporting as Internal Dossier with Production badge", async () => {
    const { screen } = renderAt("/work/labor-solutions/engage-reporting");
    const stage = screen.getByRole("main");

    await expect.element(stage.getByRole("heading", { name: /^Engage reporting$/i })).toBeVisible();
    await expect.element(stage.getByText(/^Production$/i)).toBeVisible();
    await expect
      .element(stage.getByRole("article", { name: /Engage reporting Internal Dossier/i }))
      .toBeVisible();
    await expect.element(stage).not.toHaveTextContent(/Work Case · Engage reporting \(stub\)/i);
    await expect.element(stage).not.toHaveTextContent(/Public Storefront/i);
  });

  it("shows proof-first outcomes and problem→solution artifacts without fake screenshots", async () => {
    const { screen } = renderAt("/work/labor-solutions/engage-reporting");
    const stage = screen.getByRole("main");

    await expect.element(stage).toHaveTextContent(/no public demo URL/i);
    await expect.element(stage.getByRole("list", { name: /^Outcomes$/i })).toBeVisible();
    await expect.element(stage).toHaveTextContent(/Problem → solution/i);
    await expect.element(stage).toHaveTextContent(/Reporting artifacts shipped in-product/i);
    await expect.element(stage).toHaveTextContent(/dashboard vs Excel score drift/i);
    await expect
      .element(stage.getByRole("region", { name: /case media/i }))
      .not.toBeInTheDocument();
    await expect.element(stage).not.toHaveTextContent(/Shot \d/i);
    await expect.element(stage).not.toHaveTextContent(/redacted/i);
  });

  it("keeps Preview disabled and Live auth-walled without a public URL", async () => {
    const { screen } = renderAt("/work/labor-solutions/engage-reporting");
    const rail = screen.getByRole("complementary", { name: /context rail/i });

    const previewChip = screen.getByRole("button", { name: /^Preview$/i });
    await expect.element(previewChip).toBeVisible();
    expect(previewChip.element().hasAttribute("disabled")).toBe(true);
    await expect
      .element(screen.getByRole("dialog", { name: /^Preview$/i }))
      .not.toBeInTheDocument();

    await expect.element(rail).toHaveTextContent(/Auth-walled · no public URL/i);
    await expect.element(rail.getByRole("link", { name: /https?:\/\//i })).not.toBeInTheDocument();
  });

  it("binds Context Rail Live/Role/Outcomes/Stack in Work order for Engage", async () => {
    const { screen } = renderAt("/work/labor-solutions/engage-reporting");
    const rail = screen.getByRole("complementary", { name: /context rail/i });

    await expect.element(rail.getByText(/^Availability$/i)).toBeVisible();
    await expect.element(rail.getByText(/^Live$/i)).toBeVisible();
    await expect.element(rail.getByText(/^Role$/i)).toBeVisible();
    await expect.element(rail.getByText(/^Outcomes$/i)).toBeVisible();
    await expect.element(rail.getByText(/^Stack$/i)).toBeVisible();
    await expect.element(rail).toHaveTextContent(/Labor Solutions/i);
    await expect.element(rail).toHaveTextContent(/Reporting artifacts shipped in-product/i);
    await expect.element(rail.getByText(/^Metabase Embedding SDK$/i)).toBeVisible();

    const text = rail.element().textContent ?? "";
    const markers = ["Availability", "Live", "Role", "Outcomes", "Stack", "Get in touch"];
    let previous = -1;
    for (const marker of markers) {
      const index = text.indexOf(marker);
      expect(index, `expected "${marker}" after prior sections`).toBeGreaterThan(previous);
      previous = index;
    }
  });

  it("surfaces only Public Claims in center and rail copy", async () => {
    const { screen } = renderAt("/work/labor-solutions/engage-reporting");
    const stage = screen.getByRole("main");
    const rail = screen.getByRole("complementary", { name: /context rail/i });

    await expect.element(stage).toHaveTextContent(/single scoring authority/i);
    await expect.element(rail).toHaveTextContent(/single scoring authority/i);
    await expect.element(stage).not.toHaveTextContent(/71\.47/i);
    await expect.element(rail).not.toHaveTextContent(/71\.47/i);
    await expect.element(stage).not.toHaveTextContent(/29%→9%/i);
    await expect.element(rail).not.toHaveTextContent(/29%→9%/i);
    await expect.element(stage).not.toHaveTextContent(/124 PRs/i);
    await expect.element(rail).not.toHaveTextContent(/124 PRs/i);
    await expect.element(stage).not.toHaveTextContent(/\(stub\)/i);
    await expect.element(rail).not.toHaveTextContent(/\(stub\)/i);
  });
});

const internalDossierCases = [
  {
    path: "/work/labor-solutions/indicator-bank",
    title: /^Indicator Bank$/i,
    article: /Indicator Bank Internal Dossier/i,
    folder: /Labor Solutions/i,
    claim: /four administration surfaces/i,
    stack: /^Django$/i,
    forbidden: [/OKR at 1\.0/i, /WPM-3219/i, /71\.47/i, /29%→9%/i, /124 PRs/i],
  },
  {
    path: "/work/advance-auto-parts/measurement-framework",
    title: /^Measurement Framework$/i,
    article: /Measurement Framework Internal Dossier/i,
    folder: /Advance Auto Parts/i,
    claim: /store KPI measurement UI/i,
    stack: /^Snowflake$/i,
    forbidden: [/owned the/i, /redacted/i],
  },
  {
    path: "/work/advance-auto-parts/model-deployment-framework",
    title: /^Model Deployment Framework$/i,
    article: /Model Deployment Framework Internal Dossier/i,
    folder: /Advance Auto Parts/i,
    claim: /self-service ML model hosting/i,
    stack: /^Tailwind CSS$/i,
    forbidden: [/owned the/i, /redacted/i],
  },
  {
    path: "/work/advance-auto-parts/store-dashboard",
    title: /^Store Dashboard$/i,
    article: /Store Dashboard Internal Dossier/i,
    folder: /Advance Auto Parts/i,
    claim: /actual vs predicted/i,
    stack: /^Streamlit$/i,
    forbidden: [/owned the/i, /redacted/i],
  },
] as const;

describe("Internal Dossier Indicator Bank and Advance Auto Parts (App Shell seam)", () => {
  afterEach(() => cleanup());

  for (const dossier of internalDossierCases) {
    it(`deep-links ${dossier.path} as Internal Dossier Production under its Work Folder`, async () => {
      const { screen } = renderAt(dossier.path);
      const stage = screen.getByRole("main");

      await expect.element(stage.getByRole("heading", { name: dossier.title })).toBeVisible();
      await expect.element(stage.getByText(/^Production$/i)).toBeVisible();
      await expect.element(stage).toHaveTextContent(dossier.folder);
      await expect.element(stage.getByRole("article", { name: dossier.article })).toBeVisible();
      await expect.element(stage).not.toHaveTextContent(/\(stub\)/i);
      await expect.element(stage).not.toHaveTextContent(/Public Storefront/i);
    });

    it(`keeps Preview off and Live without a public URL for ${dossier.path}`, async () => {
      const { screen } = renderAt(dossier.path);
      const rail = screen.getByRole("complementary", { name: /context rail/i });

      const previewChip = screen.getByRole("button", { name: /^Preview$/i });
      await expect.element(previewChip).toBeVisible();
      expect(previewChip.element().hasAttribute("disabled")).toBe(true);
      await expect
        .element(screen.getByRole("dialog", { name: /^Preview$/i }))
        .not.toBeInTheDocument();

      await expect.element(rail).toHaveTextContent(/Auth-walled · no public URL/i);
      await expect
        .element(rail.getByRole("link", { name: /https?:\/\//i }))
        .not.toBeInTheDocument();
    });

    it(`shows Public Claims without fake screenshots for ${dossier.path}`, async () => {
      const { screen } = renderAt(dossier.path);
      const stage = screen.getByRole("main");
      const rail = screen.getByRole("complementary", { name: /context rail/i });

      await expect.element(stage).toHaveTextContent(/no public demo URL/i);
      await expect.element(stage.getByRole("list", { name: /^Outcomes$/i })).toBeVisible();
      await expect.element(stage).toHaveTextContent(dossier.claim);
      await expect.element(rail).toHaveTextContent(dossier.claim);
      await expect.element(rail.getByText(dossier.stack)).toBeVisible();
      await expect
        .element(stage.getByRole("region", { name: /case media/i }))
        .not.toBeInTheDocument();
      await expect.element(stage).not.toHaveTextContent(/Shot \d/i);
      await expect.element(stage).not.toHaveTextContent(/redacted/i);
      await expect.element(stage).not.toHaveTextContent(/\(stub\)/i);
      await expect.element(rail).not.toHaveTextContent(/\(stub\)/i);

      for (const pattern of dossier.forbidden) {
        await expect.element(stage).not.toHaveTextContent(pattern);
        await expect.element(rail).not.toHaveTextContent(pattern);
      }
    });
  }
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
