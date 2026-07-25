import { cleanup, render } from "@solidjs/testing-library";
import { createMemoryHistory, MemoryRouter } from "@solidjs/router";
import { afterEach, describe, expect, it, vi } from "vitest";
import { page } from "vitest/browser";
import { AppShellRoutes } from "./app";
import { CONTACT_EMAIL } from "./contact/content";
import {
  HIRE_SIGNAL_SNOOZE_KEY,
  HIRE_SIGNAL_SNOOZE_MS,
  setHireSignalEnabledForTests,
} from "./shell/hire-signal";
import { THEME_STORAGE_KEY } from "./theme/theme";
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

describe("App Shell Mode routes (App Shell seam)", () => {
  afterEach(() => cleanup());

  it("shows Contact Mode for Contact Mode URL", async () => {
    const { screen } = renderAt("/contact");
    await expect
      .element(screen.getByRole("main").getByRole("heading", { name: /^Get in touch$/i }))
      .toBeVisible();
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
    await expect
      .element(screen.getByRole("main").getByRole("heading", { name: /^Vishal Kumar$/i }))
      .toBeVisible();
    expect(history.get()).toBe("/about");

    await screen.getByRole("link", { name: /^Resume$/i }).click();
    await expect.element(screen.getByRole("main").getByTitle(/Vishal Kumar resume/i)).toBeVisible();
    expect(history.get()).toBe("/resume");

    await screen.getByRole("link", { name: /^Contact$/i }).click();
    await expect
      .element(screen.getByRole("main").getByRole("heading", { name: /^Get in touch$/i }))
      .toBeVisible();
    expect(history.get()).toBe("/contact");

    await screen.getByRole("link", { name: /^Work$/i }).click();
    await expect
      .element(screen.getByRole("main").getByRole("heading", { name: /^All work$/i }))
      .toBeVisible();
    expect(history.get()).toBe("/work");
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
    await expect
      .element(screen.getByRole("main").getByRole("heading", { name: /^Get in touch$/i }))
      .toBeVisible();

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

  it("keeps Production / Prototype badges off left Work tree case rows", async () => {
    const { screen } = renderAt("/");
    const tree = screen.getByRole("navigation", { name: /work tree/i });
    await expect.element(tree).toBeVisible();

    await expect.element(tree.getByRole("link", { name: /^Engage reporting$/i })).toBeVisible();
    await expect.element(tree.getByRole("link", { name: /^SupplyChain\+$/i })).toBeVisible();
    await expect.element(tree.getByText(/^Production$/i)).not.toBeInTheDocument();
    await expect.element(tree.getByText(/^Prototype$/i)).not.toBeInTheDocument();
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
    expect(history.get()).toBe(SUPPLY_CHAIN_PATH);
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

  it("omits a duplicate All work row from the left Work tree", async () => {
    const { screen } = renderAt("/");
    const tree = screen.getByRole("navigation", { name: /work tree/i });
    await expect.element(tree).toBeVisible();
    await expect.element(tree.getByRole("link", { name: /^All work$/i })).not.toBeInTheDocument();
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
    const { screen } = renderAt(SUPPLY_CHAIN_PATH);
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
    expect(history.get()).toBe(SUPPLY_CHAIN_PATH);
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

describe("About home IA (App Shell seam)", () => {
  afterEach(() => cleanup());

  it("cold-loads / as About Mode", async () => {
    const { screen } = renderAt("/");
    const stage = screen.getByRole("main");
    await expect.element(stage.getByRole("heading", { name: /^Vishal Kumar$/i })).toBeVisible();
    await expect.element(stage.getByText(/^About$/i)).toBeVisible();
    await expect
      .element(stage.getByRole("heading", { name: /^SupplyChain\+$/i }))
      .not.toBeInTheDocument();
  });

  it("shows the same About surface at /about", async () => {
    const { screen } = renderAt("/about");
    const stage = screen.getByRole("main");
    await expect.element(stage.getByRole("heading", { name: /^Vishal Kumar$/i })).toBeVisible();
    await expect.element(stage.getByText(/^About$/i)).toBeVisible();
  });

  it("binds About Context Rail on /", async () => {
    const { screen } = renderAt("/");
    const rail = screen.getByRole("complementary", { name: /context rail/i });
    await expect.element(rail.getByText(/^Availability$/i)).toBeVisible();
    await expect.element(rail.getByText(/^Facts$/i)).toBeVisible();
    await expect.element(rail.getByText(/^Elsewhere$/i)).toBeVisible();
    await expect.element(rail).not.toHaveTextContent(/sc-plus\.vercel\.app/i);
  });
});

describe("Public Storefront SupplyChain+ (App Shell seam)", () => {
  afterEach(() => cleanup());

  it("keeps center proof-first with outcomes above media", async () => {
    const { screen } = renderAt(SUPPLY_CHAIN_PATH);
    const stage = screen.getByRole("main");
    await expect.element(stage.getByRole("heading", { name: /^SupplyChain\+$/i })).toBeVisible();

    const text = stage.element().textContent ?? "";
    const outcomesIndex = text.search(/explainable supplier-risk scoring/i);
    const mediaIndex = text.search(/Shot 1/i);
    expect(outcomesIndex).toBeGreaterThan(-1);
    expect(mediaIndex).toBeGreaterThan(outcomesIndex);
  });

  it("shows Prototype badge and Live pointing at the honest public URL", async () => {
    const { screen } = renderAt(SUPPLY_CHAIN_PATH);
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

  it("binds Context Rail Live/Role/Outcomes/Stack to SupplyChain+", async () => {
    const { screen } = renderAt(SUPPLY_CHAIN_PATH);
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
    const { screen } = renderAt(SUPPLY_CHAIN_PATH);
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
    const { screen } = renderAt(SUPPLY_CHAIN_PATH);
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
    const { screen } = renderAt(SUPPLY_CHAIN_PATH);
    const stage = screen.getByRole("main");
    const carousel = stage.getByRole("region", { name: /case media/i });

    await expect.element(carousel).toBeVisible();
    await expect.element(carousel).toHaveTextContent(/Shot 1/i);
    await expect.element(stage).not.toHaveTextContent(/media placeholder/i);

    await carousel.getByRole("button", { name: /next/i }).click();
    await expect.element(carousel).toHaveTextContent(/Shot 2/i);
  });

  it("opens a Preview slide-over with Desktop/Mobile frames from the header chip", async () => {
    const { screen } = renderAt(SUPPLY_CHAIN_PATH);

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

  it("closes Preview without losing the active Work Case", async () => {
    const { history, screen } = renderAt(SUPPLY_CHAIN_PATH);

    await screen.getByRole("button", { name: /^Preview$/i }).click();
    const dialog = screen.getByRole("dialog", { name: /^Preview$/i });
    await expect.element(dialog).toBeVisible();

    await dialog.getByRole("button", { name: /close preview/i }).click();
    await expect
      .element(screen.getByRole("dialog", { name: /^Preview$/i }))
      .not.toBeInTheDocument();
    expect(history.get()).toBe(SUPPLY_CHAIN_PATH);
    await expect
      .element(screen.getByRole("main").getByRole("heading", { name: /^SupplyChain\+$/i }))
      .toBeVisible();
  });
});

const qgenaiAndToolsStorefronts = [
  {
    path: "/work/prototypes/qgenai",
    title: /^QGenAI$/i,
    article: /QGenAI Public Storefront/i,
    badge: /^Prototype$/i,
    liveHref: "https://qgenai.vercel.app",
    liveLabel: /qgenai\.vercel\.app/i,
    claim: /Prompt-to-survey UI/i,
    stack: /^Vercel AI SDK$/i,
    forbidden: [/\(stub\)/i],
  },
  {
    path: "/work/tools/snap2paper",
    title: /^Snap2Paper$/i,
    article: /Snap2Paper Public Storefront/i,
    badge: /^Production$/i,
    liveHref: "https://mcq.vishalk.com/",
    liveLabel: /mcq\.vishalk\.com/i,
    claim: /editable MCQ/i,
    stack: /^Gemini$/i,
    forbidden: [/\(stub\)/i],
  },
  {
    path: "/work/tools/photogrid",
    title: /^PhotoGrid$/i,
    article: /PhotoGrid Public Storefront/i,
    badge: /^Production$/i,
    liveHref: "https://printgrid.vishalk.com/",
    liveLabel: /printgrid\.vishalk\.com/i,
    claim: /passport/i,
    stack: /^Client-side PDF$/i,
    forbidden: [/\(stub\)/i],
  },
  {
    path: "/work/tools/pdfgrid",
    title: /^PDFGrid$/i,
    article: /PDFGrid Public Storefront/i,
    badge: /^Production$/i,
    liveHref: "https://pdfgrid.vishalk.com/",
    liveLabel: /pdfgrid\.vishalk\.com/i,
    claim: /N-Up/i,
    stack: /^Client-side layout$/i,
    forbidden: [/\(stub\)/i],
  },
] as const;

describe("Public Storefront QGenAI and Tools (App Shell seam)", () => {
  afterEach(() => cleanup());

  for (const storefront of qgenaiAndToolsStorefronts) {
    it(`deep-links ${storefront.path} as Public Storefront with honest Live URL`, async () => {
      const { screen } = renderAt(storefront.path);
      const stage = screen.getByRole("main");
      const rail = screen.getByRole("complementary", { name: /context rail/i });

      await expect.element(stage.getByRole("heading", { name: storefront.title })).toBeVisible();
      await expect.element(stage.getByText(storefront.badge)).toBeVisible();
      await expect.element(stage.getByRole("article", { name: storefront.article })).toBeVisible();
      await expect.element(stage).not.toHaveTextContent(/Work Case · .* \(stub\)/i);

      const liveLink = rail.getByRole("link", { name: storefront.liveLabel });
      await expect.element(liveLink).toBeVisible();
      expect(liveLink.element().getAttribute("href")).toBe(storefront.liveHref);
    });

    it(`keeps carousel + Preview on for ${storefront.path}`, async () => {
      const { screen } = renderAt(storefront.path);
      const stage = screen.getByRole("main");
      const carousel = stage.getByRole("region", { name: /case media/i });

      await expect.element(carousel).toBeVisible();
      await expect.element(carousel).toHaveTextContent(/Shot 1/i);
      await carousel.getByRole("button", { name: /next/i }).click();
      await expect.element(carousel).toHaveTextContent(/Shot 2/i);

      const previewChip = screen.getByRole("button", { name: /^Preview$/i });
      await expect.element(previewChip).toBeVisible();
      expect(previewChip.element().hasAttribute("disabled")).toBe(false);

      await previewChip.click();
      const dialog = screen.getByRole("dialog", { name: /^Preview$/i });
      await expect.element(dialog).toBeVisible();
      await expect.element(dialog).toHaveTextContent(storefront.liveLabel);
    });

    it(`surfaces Public Claims in center and Context Rail for ${storefront.path}`, async () => {
      const { screen } = renderAt(storefront.path);
      const stage = screen.getByRole("main");
      const rail = screen.getByRole("complementary", { name: /context rail/i });

      await expect.element(stage.getByRole("list", { name: /^Outcomes$/i })).toBeVisible();
      await expect.element(stage).toHaveTextContent(storefront.claim);
      await expect.element(rail).toHaveTextContent(storefront.claim);
      await expect.element(rail.getByText(storefront.stack)).toBeVisible();
      await expect.element(rail.getByText(/^Live$/i)).toBeVisible();
      await expect.element(rail.getByText(/^Role$/i)).toBeVisible();
      await expect.element(rail.getByText(/^Outcomes$/i)).toBeVisible();
      await expect.element(rail.getByText(/^Stack$/i)).toBeVisible();

      const text = stage.element().textContent ?? "";
      const outcomesIndex = text.search(storefront.claim);
      const mediaIndex = text.search(/Shot 1/i);
      expect(outcomesIndex).toBeGreaterThan(-1);
      expect(mediaIndex).toBeGreaterThan(outcomesIndex);

      for (const pattern of storefront.forbidden) {
        await expect.element(stage).not.toHaveTextContent(pattern);
        await expect.element(rail).not.toHaveTextContent(pattern);
      }
    });
  }
});

describe("About Mode (App Shell seam)", () => {
  afterEach(() => cleanup());

  it("shows pitch and skills strip in the center on /about", async () => {
    const { screen } = renderAt("/about");
    const stage = screen.getByRole("main");

    await expect.element(stage.getByRole("heading", { name: /^Vishal Kumar$/i })).toBeVisible();
    await expect
      .element(
        stage.getByText(
          /Senior Frontend Engineer · React \/ Next\.js · Analytics & Reporting UIs/i,
        ),
      )
      .toBeVisible();
    await expect
      .element(
        stage.getByText(
          /7\+ years on data-heavy reporting UIs for remote US\/APAC teams — 13\+ years total/i,
        ),
      )
      .toBeVisible();

    const skills = stage.getByRole("list", { name: /^Skills$/i });
    await expect.element(skills).toBeVisible();
    for (const skill of [
      "Next.js",
      "React",
      "TypeScript",
      "JavaScript",
      "Figma",
      "Metabase",
      "Playwright",
    ]) {
      await expect.element(skills.getByText(skill)).toBeVisible();
    }
  });

  it("omits a seeking-roles line from the About center", async () => {
    const { screen } = renderAt("/about");
    const stage = screen.getByRole("main");

    await expect.element(stage).not.toHaveTextContent(/seeking roles/i);
    await expect.element(stage).not.toHaveTextContent(/seeking senior/i);
  });

  it("shows Availability CTA, Facts, and Elsewhere in Context Rail order", async () => {
    const { screen } = renderAt("/about");
    const rail = screen.getByRole("complementary", { name: /context rail/i });
    await expect.element(rail).toBeVisible();

    await expect.element(rail.getByText(/^Availability$/i)).toBeVisible();
    await expect.element(rail.getByRole("link", { name: /get in touch/i })).toBeVisible();
    await expect.element(rail.getByText(/^Facts$/i)).toBeVisible();
    await expect.element(rail.getByText(/^Elsewhere$/i)).toBeVisible();
    await expect.element(rail.getByText(/Punjab · remote/i)).toBeVisible();
    await expect.element(rail.getByText(/13\+ yrs/i)).toBeVisible();
    await expect.element(rail.getByText("Reporting UIs", { exact: true })).toBeVisible();
    await expect.element(rail.getByRole("link", { name: /Resume \(PDF\)/i })).toBeVisible();
    await expect.element(rail.getByRole("link", { name: /^LinkedIn/i })).toBeVisible();
    await expect.element(rail.getByRole("link", { name: /^GitHub/i })).toBeVisible();

    const text = rail.element().textContent ?? "";
    const markers = ["Availability", "Facts", "Elsewhere"];
    let previous = -1;
    for (const marker of markers) {
      const index = text.indexOf(marker);
      expect(index, `expected "${marker}" after prior sections`).toBeGreaterThan(previous);
      previous = index;
    }
  });

  it("keeps Notes absent from Mode nav while on About", async () => {
    const { screen } = renderAt("/about");
    const nav = screen.getByRole("navigation", { name: /modes/i });
    await expect.element(nav).toBeVisible();
    await expect.element(screen.getByRole("link", { name: /^Notes$/i })).not.toBeInTheDocument();
    await expect.element(nav).not.toHaveTextContent(/Notes/i);
  });
});

describe("Resume Surface (App Shell seam)", () => {
  afterEach(() => cleanup());

  it("embeds the real PDF in the center stage on /resume", async () => {
    const { screen } = renderAt("/resume");
    const stage = screen.getByRole("main");

    const embed = stage.getByTitle(/Vishal Kumar resume/i);
    await expect.element(embed).toBeVisible();
    expect(embed.element().getAttribute("src")).toBe("/vishal-cv.pdf");
    await expect.element(stage.getByRole("article", { name: /Resume Surface/i })).toBeVisible();
  });

  it("does not rebuild the CV as HTML in the center", async () => {
    const { screen } = renderAt("/resume");
    const stage = screen.getByRole("main");

    await expect
      .element(stage.getByRole("heading", { name: /^Vishal Kumar$/i }))
      .not.toBeInTheDocument();
    await expect.element(stage.getByRole("list", { name: /^Skills$/i })).not.toBeInTheDocument();
    await expect
      .element(
        stage.getByText(
          /7\+ years on data-heavy reporting UIs for remote US\/APAC teams — 13\+ years total/i,
        ),
      )
      .not.toBeInTheDocument();
    await expect.element(stage).not.toHaveTextContent(/\(stub\)/i);
  });

  it("keeps shell chrome and a thin Context Rail with links and Availability CTA", async () => {
    const { screen } = renderAt("/resume");

    await expect.element(screen.getByRole("navigation", { name: /modes/i })).toBeVisible();
    await expect.element(screen.getByRole("main")).toBeVisible();

    const rail = screen.getByRole("complementary", { name: /context rail/i });
    await expect.element(rail).toBeVisible();
    await expect.element(rail.getByText(/^Availability$/i)).toBeVisible();
    await expect.element(rail.getByRole("link", { name: /get in touch/i })).toBeVisible();
    await expect.element(rail.getByText(/^Links$/i)).toBeVisible();
    await expect.element(rail.getByRole("link", { name: /Download PDF/i })).toBeVisible();
    expect(
      rail
        .getByRole("link", { name: /Download PDF/i })
        .element()
        .getAttribute("href"),
    ).toBe("/vishal-cv.pdf");
    await expect.element(rail.getByRole("link", { name: /^LinkedIn/i })).toBeVisible();
    await expect.element(rail.getByRole("link", { name: /^GitHub/i })).toBeVisible();
    await expect.element(rail).not.toHaveTextContent(/Context follows the active Mode/i);

    const text = rail.element().textContent ?? "";
    const markers = ["Availability", "Links"];
    let previous = -1;
    for (const marker of markers) {
      const index = text.indexOf(marker);
      expect(index, `expected "${marker}" after prior sections`).toBeGreaterThan(previous);
      previous = index;
    }
  });

  it("deep-links /resume to the Resume Surface", async () => {
    const { history, screen } = renderAt("/resume");
    expect(history.get()).toBe("/resume");
    await expect.element(screen.getByRole("main").getByTitle(/Vishal Kumar resume/i)).toBeVisible();
    await expect
      .element(
        screen.getByRole("navigation", { name: /modes/i }).getByRole("link", { name: /^Resume$/i }),
      )
      .toBeVisible();
  });
});

describe("Contact Mode (App Shell seam)", () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("shows the full form in the center on /contact", async () => {
    const { screen } = renderAt("/contact");
    const stage = screen.getByRole("main");

    await expect.element(stage.getByRole("heading", { name: /^Get in touch$/i })).toBeVisible();
    await expect.element(stage.getByLabelText(/^Name$/i)).toBeVisible();
    await expect.element(stage.getByLabelText(/^Email$/i)).toBeVisible();
    await expect.element(stage.getByLabelText(/^Message$/i)).toBeVisible();
    await expect.element(stage.getByRole("button", { name: /^Send message$/i })).toBeVisible();
    await expect.element(stage).not.toHaveTextContent(/\(stub\)/i);
  });

  it("validates name, email, and message before submit", async () => {
    const { screen } = renderAt("/contact");
    const stage = screen.getByRole("main");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await stage.getByRole("button", { name: /^Send message$/i }).click();

    await expect.element(stage.getByText(/^Name is required$/i)).toBeVisible();
    await expect.element(stage.getByText(/^Invalid email address$/i)).toBeVisible();
    await expect.element(stage.getByText(/^Message is required$/i)).toBeVisible();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("submits a valid form and shows the success message", async () => {
    const fetchMock = vi.fn<(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>>(
      async () =>
        new Response(JSON.stringify({ success: true, message: "Message sent successfully!" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const { screen } = renderAt("/contact");
    const stage = screen.getByRole("main");

    await stage.getByLabelText(/^Name$/i).fill("Ada Lovelace");
    await stage.getByLabelText(/^Email$/i).fill("ada@example.com");
    await stage.getByLabelText(/^Message$/i).fill("Hello from Analytical Engine.");
    await stage.getByRole("button", { name: /^Send message$/i }).click();

    await expect.element(stage.getByText(/^Message sent successfully!$/i)).toBeVisible();
    expect(fetchMock).toHaveBeenCalledOnce();
    const call = fetchMock.mock.calls[0];
    expect(call).toBeDefined();
    const [url, init] = call!;
    expect(url).toBe("/api/contact");
    expect(init?.method).toBe("POST");
    expect(JSON.parse(String(init?.body))).toEqual({
      name: "Ada Lovelace",
      email: "ada@example.com",
      message: "Hello from Analytical Engine.",
    });
  });

  it("surfaces a safe delivery error without leaking internals", async () => {
    const fetchMock = vi.fn(
      async () =>
        new Response(
          JSON.stringify({
            error: true,
            message: "Email service is temporarily unavailable. Please contact me directly.",
          }),
          { status: 500, headers: { "Content-Type": "application/json" } },
        ),
    );
    vi.stubGlobal("fetch", fetchMock);

    const { screen } = renderAt("/contact");
    const stage = screen.getByRole("main");

    await stage.getByLabelText(/^Name$/i).fill("Ada Lovelace");
    await stage.getByLabelText(/^Email$/i).fill("ada@example.com");
    await stage.getByLabelText(/^Message$/i).fill("Hello from Analytical Engine.");
    await stage.getByRole("button", { name: /^Send message$/i }).click();

    await expect
      .element(
        stage.getByText(/Email service is temporarily unavailable\. Please contact me directly\./i),
      )
      .toBeVisible();
    await expect.element(stage.getByRole("link", { name: /Email me directly/i })).toBeVisible();
    expect(
      stage
        .getByRole("link", { name: /Email me directly/i })
        .element()
        .getAttribute("href"),
    ).toBe(`mailto:${CONTACT_EMAIL}`);
    await expect.element(stage).not.toHaveTextContent(/RESEND_API_KEY|stack|re_/i);
  });

  it("shows availability plus email / LinkedIn / GitHub / CV in the Context Rail", async () => {
    const { screen } = renderAt("/contact");
    const rail = screen.getByRole("complementary", { name: /context rail/i });

    await expect.element(rail.getByText(/^Availability$/i)).toBeVisible();
    await expect.element(rail).toHaveTextContent(/Open to roles · Senior Frontend/i);
    await expect.element(rail.getByText(/^Quick links$/i)).toBeVisible();

    const email = rail.getByRole("link", { name: /^Email/i });
    await expect.element(email).toBeVisible();
    expect(email.element().getAttribute("href")).toBe(`mailto:${CONTACT_EMAIL}`);

    const linkedIn = rail.getByRole("link", { name: /^LinkedIn/i });
    await expect.element(linkedIn).toBeVisible();
    expect(linkedIn.element().getAttribute("href")).toBe(
      "https://www.linkedin.com/in/vishalkdotcom",
    );

    const github = rail.getByRole("link", { name: /^GitHub/i });
    await expect.element(github).toBeVisible();
    expect(github.element().getAttribute("href")).toBe("https://github.com/vishalkdotcom");

    const cv = rail.getByRole("link", { name: /^CV/i });
    await expect.element(cv).toBeVisible();
    expect(cv.element().getAttribute("href")).toBe("/vishal-cv.pdf");

    const text = rail.element().textContent ?? "";
    const markers = ["Availability", "Quick links"];
    let previous = -1;
    for (const marker of markers) {
      const index = text.indexOf(marker);
      expect(index, `expected "${marker}" after prior sections`).toBeGreaterThan(previous);
      previous = index;
    }
  });

  it("keeps Contact Mode and quick links available without Hire Signal gating", async () => {
    const { screen } = renderAt("/contact");
    const stage = screen.getByRole("main");
    const rail = screen.getByRole("complementary", { name: /context rail/i });

    await expect.element(stage.getByRole("heading", { name: /^Get in touch$/i })).toBeVisible();
    await expect.element(rail.getByRole("link", { name: /^Email/i })).toBeVisible();
    await expect.element(rail.getByRole("link", { name: /^LinkedIn/i })).toBeVisible();
    await expect.element(rail.getByRole("link", { name: /^GitHub/i })).toBeVisible();
    await expect.element(rail.getByRole("link", { name: /^CV/i })).toBeVisible();
  });

  it("deep-links /contact to Contact Mode", async () => {
    const { history, screen } = renderAt("/contact");
    expect(history.get()).toBe("/contact");
    await expect
      .element(screen.getByRole("main").getByRole("heading", { name: /^Get in touch$/i }))
      .toBeVisible();
    await expect
      .element(
        screen
          .getByRole("navigation", { name: /modes/i })
          .getByRole("link", { name: /^Contact$/i }),
      )
      .toBeVisible();
  });
});

const MOBILE_VIEWPORT = { width: 390, height: 844 } as const;
const DESKTOP_VIEWPORT = { width: 1280, height: 800 } as const;

async function setMobileViewport() {
  await page.viewport(MOBILE_VIEWPORT.width, MOBILE_VIEWPORT.height);
}

async function restoreDesktopViewport() {
  await page.viewport(DESKTOP_VIEWPORT.width, DESKTOP_VIEWPORT.height);
}

describe("Mobile App Shell (App Shell seam)", () => {
  afterEach(async () => {
    cleanup();
    await restoreDesktopViewport();
  });

  it("uses a single-column active surface with no bottom tabs or always-on icon rail", async () => {
    await setMobileViewport();
    const { screen } = renderAt("/");

    await expect.element(screen.getByRole("main")).toBeVisible();
    await expect.element(screen.getByRole("button", { name: /open navigation/i })).toBeVisible();
    await expect.element(screen.getByRole("button", { name: /open context/i })).toBeVisible();

    await expect
      .element(screen.getByRole("navigation", { name: /modes/i }))
      .not.toBeInTheDocument();
    await expect
      .element(screen.getByRole("complementary", { name: /context rail/i }))
      .not.toBeInTheDocument();
    await expect.element(screen.getByRole("tablist")).not.toBeInTheDocument();
    await expect
      .element(screen.getByRole("button", { name: /collapse left/i }))
      .not.toBeInTheDocument();
  });

  it("opens Modes + Work tree in the left IA drawer from ☰", async () => {
    await setMobileViewport();
    const { history, screen } = renderAt("/");

    await screen.getByRole("button", { name: /open navigation/i }).click();
    const drawer = screen.getByRole("dialog", { name: /navigation/i });
    await expect.element(drawer).toBeVisible();
    await expect.element(drawer.getByRole("navigation", { name: /modes/i })).toBeVisible();
    await expect.element(drawer.getByRole("link", { name: /^About$/i })).toBeVisible();
    await expect.element(drawer.getByRole("link", { name: /Engage reporting/i })).toBeVisible();
    await expect.element(drawer.getByRole("button", { name: /theme/i })).toBeVisible();

    await drawer.getByRole("link", { name: /^About$/i }).click();
    expect(history.get()).toBe("/about");
    await expect
      .element(screen.getByRole("dialog", { name: /navigation/i }))
      .not.toBeInTheDocument();
    await expect
      .element(screen.getByRole("main").getByRole("heading", { name: /^Vishal Kumar$/i }))
      .toBeVisible();
  });

  it("opens Context Rail content as a sheet from ···, full-screen when dense", async () => {
    await setMobileViewport();
    const { screen } = renderAt(SUPPLY_CHAIN_PATH);

    await screen.getByRole("button", { name: /open context/i }).click();
    const sheet = screen.getByRole("dialog", { name: /context/i });
    await expect.element(sheet).toBeVisible();
    expect(sheet.element().getAttribute("data-dense")).toBe("");
    await expect.element(sheet.getByText(/^Live$/i)).toBeVisible();
    await expect.element(sheet.getByText(/^Role$/i)).toBeVisible();
    await expect.element(sheet.getByText(/^Outcomes$/i)).toBeVisible();
    await expect.element(sheet.getByText(/^Stack$/i)).toBeVisible();
    await expect.element(sheet).toHaveTextContent(/sc-plus\.vercel\.app/i);

    cleanup();
    const about = renderAt("/");
    await about.screen.getByRole("button", { name: /open context/i }).click();
    const aboutSheet = about.screen.getByRole("dialog", { name: /context/i });
    await expect.element(aboutSheet).toBeVisible();
    expect(aboutSheet.element().hasAttribute("data-dense")).toBe(false);
    await expect.element(aboutSheet.getByText(/^Availability$/i)).toBeVisible();
    await expect.element(aboutSheet.getByText(/^Facts$/i)).toBeVisible();
  });

  it("shows a header crumb for wayfinding", async () => {
    await setMobileViewport();
    const { screen } = renderAt("/");

    const crumb = screen.getByRole("navigation", { name: /breadcrumb/i });
    await expect.element(crumb).toBeVisible();
    await expect.element(crumb).toHaveTextContent(/About/i);
    await expect.element(crumb).not.toHaveTextContent(/SupplyChain\+/i);

    cleanup();
    const storefront = renderAt(SUPPLY_CHAIN_PATH);
    const storefrontCrumb = storefront.screen.getByRole("navigation", { name: /breadcrumb/i });
    await expect.element(storefrontCrumb).toHaveTextContent(/Prototypes/i);
    await expect.element(storefrontCrumb).toHaveTextContent(/SupplyChain\+/i);
    await expect.element(storefrontCrumb).toHaveTextContent(/Work/i);

    cleanup();
    const dossier = renderAt("/work/labor-solutions/engage-reporting");
    const dossierCrumb = dossier.screen.getByRole("navigation", { name: /breadcrumb/i });
    await expect.element(dossierCrumb).toHaveTextContent(/Labor Solutions/i);
    await expect.element(dossierCrumb).toHaveTextContent(/Engage reporting/i);
  });

  it("opens Public Storefront Preview as a full-screen overlay and keeps Internal Dossier Preview off", async () => {
    await setMobileViewport();
    const { screen } = renderAt(SUPPLY_CHAIN_PATH);

    const previewChip = screen.getByRole("button", { name: /^Preview$/i });
    await expect.element(previewChip).toBeVisible();
    expect(previewChip.element().hasAttribute("disabled")).toBe(false);

    await previewChip.click();
    const dialog = screen.getByRole("dialog", { name: /^Preview$/i });
    await expect.element(dialog).toBeVisible();
    expect(dialog.element().getAttribute("data-preview-layout")).toBe("fullscreen");
    await expect.element(dialog.getByRole("button", { name: /^Desktop$/i })).toBeVisible();
    await expect.element(dialog.getByRole("button", { name: /^Mobile$/i })).toBeVisible();

    cleanup();
    const dossier = renderAt("/work/labor-solutions/engage-reporting");
    const dossierPreview = dossier.screen.getByRole("button", { name: /^Preview$/i });
    await expect.element(dossierPreview).toBeVisible();
    expect(dossierPreview.element().hasAttribute("disabled")).toBe(true);
    await expect
      .element(dossier.screen.getByRole("dialog", { name: /^Preview$/i }))
      .not.toBeInTheDocument();
  });
});

describe("Hire Signal (App Shell seam)", () => {
  afterEach(async () => {
    cleanup();
    setHireSignalEnabledForTests(undefined);
    localStorage.removeItem(HIRE_SIGNAL_SNOOZE_KEY);
    await restoreDesktopViewport();
  });

  it("shows desktop Context Rail hire CTA and mobile Open to roles chip when the flag is on", async () => {
    setHireSignalEnabledForTests(true);
    const desktop = renderAt(SUPPLY_CHAIN_PATH);
    const rail = desktop.screen.getByRole("complementary", { name: /context rail/i });
    await expect.element(rail.getByRole("link", { name: /^Open to roles$/i })).toBeVisible();
    await expect.element(rail.getByRole("link", { name: /get in touch/i })).toBeVisible();
    await expect.element(rail).toHaveTextContent(/Open to roles · Senior Frontend/i);
    cleanup();

    await setMobileViewport();
    const mobile = renderAt("/");
    await expect
      .element(mobile.screen.getByRole("button", { name: /^Open to roles$/i }))
      .toBeVisible();
  });

  it("keeps one Availability body on Work and About Hire Signal rails", async () => {
    setHireSignalEnabledForTests(true);
    const work = renderAt(SUPPLY_CHAIN_PATH);
    const workRail = work.screen.getByRole("complementary", { name: /context rail/i });
    await expect.element(workRail).toHaveTextContent(/Open to roles · Senior Frontend/i);
    cleanup();

    const about = renderAt("/about");
    const aboutRail = about.screen.getByRole("complementary", { name: /context rail/i });
    await expect.element(aboutRail).toHaveTextContent(/Open to roles · Senior Frontend/i);
  });

  it("hides both Hire Signal surfaces when the flag is off", async () => {
    setHireSignalEnabledForTests(false);
    const desktop = renderAt(SUPPLY_CHAIN_PATH);
    const rail = desktop.screen.getByRole("complementary", { name: /context rail/i });
    await expect.element(rail.getByText(/^Live$/i)).toBeVisible();
    await expect
      .element(rail.getByRole("link", { name: /^Open to roles$/i }))
      .not.toBeInTheDocument();
    await expect.element(rail.getByRole("link", { name: /get in touch/i })).not.toBeInTheDocument();
    cleanup();

    await setMobileViewport();
    const mobile = renderAt("/");
    await expect
      .element(mobile.screen.getByRole("button", { name: /^Open to roles$/i }))
      .not.toBeInTheDocument();
  });

  it("expands the mobile chip to Get in touch + Snooze and persists a 7-day snooze", async () => {
    setHireSignalEnabledForTests(true);
    localStorage.removeItem(HIRE_SIGNAL_SNOOZE_KEY);
    await setMobileViewport();
    const { screen, history } = renderAt("/");

    const chip = screen.getByRole("button", { name: /^Open to roles$/i });
    await expect.element(chip).toBeVisible();
    await chip.click();

    const getInTouch = screen.getByRole("link", { name: /^Get in touch$/i });
    await expect.element(getInTouch).toBeVisible();
    await expect.element(screen.getByRole("button", { name: /^Snooze$/i })).toBeVisible();
    expect(getInTouch.element().getAttribute("href")).toBe("/contact");

    await getInTouch.click();
    expect(history.get()).toBe("/contact");
    cleanup();

    const again = renderAt("/");
    await again.screen.getByRole("button", { name: /^Open to roles$/i }).click();
    const before = Date.now();
    await again.screen.getByRole("button", { name: /^Snooze$/i }).click();
    await expect
      .element(again.screen.getByRole("button", { name: /^Open to roles$/i }))
      .not.toBeInTheDocument();

    const until = Number(localStorage.getItem(HIRE_SIGNAL_SNOOZE_KEY));
    expect(until).toBeGreaterThanOrEqual(before + HIRE_SIGNAL_SNOOZE_MS);
    expect(until).toBeLessThanOrEqual(Date.now() + HIRE_SIGNAL_SNOOZE_MS);
  });

  it("never hides the desktop rail hire CTA after a mobile snooze while the flag is on", async () => {
    setHireSignalEnabledForTests(true);
    localStorage.setItem(HIRE_SIGNAL_SNOOZE_KEY, String(Date.now() + HIRE_SIGNAL_SNOOZE_MS));

    await setMobileViewport();
    const mobile = renderAt("/");
    await expect
      .element(mobile.screen.getByRole("button", { name: /^Open to roles$/i }))
      .not.toBeInTheDocument();
    cleanup();

    await restoreDesktopViewport();
    const desktop = renderAt("/about");
    const rail = desktop.screen.getByRole("complementary", { name: /context rail/i });
    await expect.element(rail.getByRole("link", { name: /get in touch/i })).toBeVisible();
  });

  it("keeps Contact Mode, form, and quick links available when Hire Signal is off", async () => {
    setHireSignalEnabledForTests(false);
    const { screen } = renderAt("/contact");
    const stage = screen.getByRole("main");
    const rail = screen.getByRole("complementary", { name: /context rail/i });

    await expect.element(stage.getByRole("heading", { name: /^Get in touch$/i })).toBeVisible();
    await expect.element(stage.getByLabelText(/^Name$/i)).toBeVisible();
    await expect.element(stage.getByLabelText(/^Email$/i)).toBeVisible();
    await expect.element(stage.getByLabelText(/^Message$/i)).toBeVisible();
    await expect.element(rail.getByRole("link", { name: /^Email/i })).toBeVisible();
    await expect.element(rail.getByRole("link", { name: /^LinkedIn/i })).toBeVisible();
    await expect.element(rail.getByRole("link", { name: /^GitHub/i })).toBeVisible();
    await expect.element(rail.getByRole("link", { name: /^CV/i })).toBeVisible();
  });
});
