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
import { getWorkCase, workCaseHref } from "./work/inventory";

const SUPPLY_CHAIN_PATH = workCaseHref("prototypes", "supplychain-plus");
const SUPPLY_CHAIN_CASE = getWorkCase("prototypes", "supplychain-plus")!;
const ENGAGE_CASE = getWorkCase("labor-solutions", "engage-reporting")!;
const INDICATOR_BANK_CASE = getWorkCase("labor-solutions", "indicator-bank")!;

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

/** Assert Case media carousel shows a wired inventory `<img>` for the first shot. */
async function expectWiredCaseMedia(
  stage: ReturnType<typeof renderAt>["screen"],
  firstShotName: RegExp,
) {
  const carousel = stage.getByRole("region", { name: /case media/i });
  await expect.element(carousel).toBeVisible();
  const firstShot = carousel.getByRole("img", { name: firstShotName });
  await expect.element(firstShot).toBeVisible();
  expect(firstShot.element().getAttribute("src")).toBeTruthy();
  return carousel;
}

describe("App Shell Mode routes (App Shell seam)", () => {
  afterEach(() => cleanup());

  it("shows Contact Mode for Contact Mode URL", async () => {
    const { screen } = renderAt("/contact");
    await expect
      .element(screen.getByRole("main").getByRole("heading", { name: /^Get in touch$/i }))
      .toBeVisible();
  });

  it("exposes brand-row theme menu with System / Light / Dark choices", async () => {
    localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
    const { screen } = renderAt("/");

    const control = screen.getByRole("button", { name: /theme/i });
    await expect.element(control).toBeVisible();

    await control.click();
    const group = screen.getByRole("radiogroup", { name: /^Theme$/i });
    await expect.element(group.getByRole("radio", { name: /^System$/i })).toBeVisible();
    await expect.element(group.getByRole("radio", { name: /^Light$/i })).toBeVisible();
    await expect.element(group.getByRole("radio", { name: /^Dark$/i })).toBeVisible();

    await group.getByRole("radio", { name: /^Light$/i }).click();
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("light");
    expect(document.documentElement.dataset.theme).toBe("light");
    await expect.element(screen.getByRole("button", { name: /Theme: Light/i })).toBeVisible();
  });

  it("applies theme-token scroll surfaces on desktop stage, Context Rail, and Work tree", async () => {
    const { screen } = renderAt("/");
    const stage = screen.getByRole("main");
    const rail = screen.getByRole("complementary", { name: /^details$/i });
    const workTree = screen.getByRole("navigation", { name: /Work tree/i });

    await expect.element(stage).toBeVisible();
    await expect.element(rail).toBeVisible();

    const workTreeScroll = workTree.element().querySelector(".vk-scroll");
    expect(workTreeScroll).toBeTruthy();

    for (const el of [stage.element(), rail.element(), workTreeScroll as HTMLElement]) {
      expect(el.classList.contains("vk-scroll")).toBe(true);
    }
  });
});

describe("Desktop Triptych Dock (App Shell seam)", () => {
  afterEach(() => cleanup());

  it("shows always-on left IA, center stage, and Context Rail", async () => {
    const { screen } = renderAt("/");
    await expect.element(screen.getByRole("navigation", { name: /modes/i })).toBeVisible();
    await expect.element(screen.getByRole("main")).toBeVisible();
    await expect.element(screen.getByRole("complementary", { name: /^details$/i })).toBeVisible();
    await expect
      .element(screen.getByText("Senior FE · Complex product UI", { exact: true }))
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
    const rightChip = screen.getByRole("button", { name: /collapse details/i });
    await expect.element(leftChip).toBeVisible();
    await expect.element(rightChip).toBeVisible();

    await rightChip.click();
    await expect.element(screen.getByRole("button", { name: /expand details/i })).toBeVisible();
    await expect
      .element(screen.getByRole("complementary", { name: /^details$/i }))
      .not.toBeInTheDocument();

    await leftChip.click();
    await expect.element(screen.getByRole("button", { name: /expand left/i })).toBeVisible();
    await expect.element(screen.getByRole("link", { name: /^About$/i })).toBeVisible();
    await screen.getByRole("link", { name: /^Contact$/i }).click();
    await expect
      .element(screen.getByRole("main").getByRole("heading", { name: /^Get in touch$/i }))
      .toBeVisible();

    await screen.getByRole("button", { name: /expand details/i }).click();
    await expect.element(screen.getByRole("complementary", { name: /^details$/i })).toBeVisible();
    await expect.element(screen.getByRole("button", { name: /collapse details/i })).toBeVisible();
  });

  it("pins a left-chrome foot with avatar and Punjab · remote", async () => {
    const { screen } = renderAt("/");
    const left = screen.getByRole("complementary", { name: /^left chrome$/i });
    const foot = left.getByRole("group", { name: /^identity$/i });

    await expect.element(foot).toBeVisible();
    await expect.element(foot.getByRole("img", { name: /^Vishal Kumar$/i })).toBeVisible();
    await expect.element(foot.getByText(/^VK$/i)).toBeVisible();
    await expect.element(foot.getByText(/^Punjab · remote$/i)).toBeVisible();
    expect(foot.element().querySelector("a")).toBeNull();
  });

  it("keeps only the avatar in the collapsed left rail foot", async () => {
    const { screen } = renderAt("/");
    const left = screen.getByRole("complementary", { name: /^left chrome$/i });
    const foot = left.getByRole("group", { name: /^identity$/i });

    await screen.getByRole("button", { name: /collapse left/i }).click();
    await expect.element(screen.getByRole("button", { name: /expand left/i })).toBeVisible();

    await expect.element(foot.getByRole("img", { name: /^Vishal Kumar$/i })).toBeVisible();
    await expect.element(foot.getByText(/^Punjab · remote$/i)).not.toBeInTheDocument();
    await expect.element(screen.getByRole("link", { name: /^About$/i })).toBeVisible();
  });

  it("shows Mode title only in the desktop header (no folder/case crumb trail)", async () => {
    const { screen } = renderAt("/");
    await expect
      .element(screen.getByRole("banner").getByRole("heading", { name: /^About$/i }))
      .toBeVisible();
    await expect
      .element(screen.getByRole("navigation", { name: /breadcrumb/i }))
      .not.toBeInTheDocument();

    cleanup();
    const storefront = renderAt(SUPPLY_CHAIN_PATH);
    await expect
      .element(storefront.screen.getByRole("banner").getByRole("heading", { name: /^Work$/i }))
      .toBeVisible();
    await expect
      .element(storefront.screen.getByRole("banner"))
      .not.toHaveTextContent(/Prototypes/i);
    await expect
      .element(storefront.screen.getByRole("banner"))
      .not.toHaveTextContent(/SupplyChain\+/i);
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

    await expect.element(tree.getByRole("link", { name: /Engage reporting/i })).toBeVisible();
    await expect.element(tree.getByRole("link", { name: /Indicator Bank/i })).toBeVisible();
    await expect.element(tree.getByRole("link", { name: /Measurement Framework/i })).toBeVisible();
    await expect
      .element(tree.getByRole("link", { name: /Model Deployment Framework/i }))
      .toBeVisible();
    await expect.element(tree.getByRole("link", { name: /Store Dashboard/i })).toBeVisible();
    await expect.element(tree.getByRole("link", { name: /SupplyChain\+/i })).toBeVisible();
    await expect.element(tree.getByRole("link", { name: /QGenAI/i })).toBeVisible();
    await expect.element(tree.getByRole("link", { name: /Snap2Paper/i })).toBeVisible();
    await expect.element(tree.getByRole("link", { name: /PhotoGrid/i })).toBeVisible();
    await expect.element(tree.getByRole("link", { name: /PDFGrid/i })).toBeVisible();
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

  it("updates URL and stage when a Work Case is selected; folder rows are not links", async () => {
    const { history, screen } = renderAt("/");
    const tree = screen.getByRole("navigation", { name: /work tree/i });

    await expect
      .element(tree.getByRole("link", { name: /^Labor Solutions$/i }))
      .not.toBeInTheDocument();
    await expect.element(tree.getByText(/^Labor Solutions$/i)).toBeVisible();

    await tree.getByRole("link", { name: /Engage reporting/i }).click();
    await expect
      .element(screen.getByRole("main").getByRole("heading", { name: /^Engage reporting$/i }))
      .toBeVisible();
    expect(history.get()).toBe("/work/labor-solutions/engage-reporting");

    await tree.getByRole("link", { name: /SupplyChain\+/i }).click();
    await expect
      .element(screen.getByRole("main").getByRole("heading", { name: /^SupplyChain\+$/i }))
      .toBeVisible();
    expect(history.get()).toBe(SUPPLY_CHAIN_PATH);
  });

  it("keeps Work Folder rows always expanded with folder SVG and no caret controls", async () => {
    const { screen } = renderAt("/");
    const tree = screen.getByRole("navigation", { name: /work tree/i });
    await expect.element(tree).toBeVisible();

    await expect.element(tree.getByRole("link", { name: /Engage reporting/i })).toBeVisible();
    await expect.element(tree.getByRole("link", { name: /Indicator Bank/i })).toBeVisible();
    await expect
      .element(screen.getByRole("button", { name: /collapse Labor Solutions/i }))
      .not.toBeInTheDocument();
    await expect
      .element(screen.getByRole("button", { name: /expand Labor Solutions/i }))
      .not.toBeInTheDocument();

    const laborLabel = tree.getByText(/^Labor Solutions$/i).element();
    expect(laborLabel.closest("div")?.querySelector("svg")).toBeTruthy();
  });
});

describe("Work dense outcome index (App Shell seam)", () => {
  afterEach(() => cleanup());

  it("does not render a Work Folder index surface at /work/<folder-slug>", async () => {
    const { screen } = renderAt("/work/labor-solutions");
    const main = screen.getByRole("main");

    await expect
      .element(main.getByRole("heading", { name: /^Labor Solutions$/i }))
      .not.toBeInTheDocument();
    await expect
      .element(main.getByText(/Cases in this group — what shipped and what changed\./i))
      .not.toBeInTheDocument();
    await expect
      .element(main.getByRole("list", { name: /outcome index/i }))
      .not.toBeInTheDocument();
    await expect
      .element(main.getByRole("link", { name: /Engage reporting/i }))
      .not.toBeInTheDocument();
    await expect
      .element(screen.getByText(/Work Folder · Labor Solutions \(stub\)/i))
      .not.toBeInTheDocument();
  });

  it("still deep-links Work Cases under a folder slug", async () => {
    const { screen } = renderAt("/work/labor-solutions/engage-reporting");
    await expect
      .element(screen.getByRole("main").getByRole("heading", { name: /^Engage reporting$/i }))
      .toBeVisible();
  });

  it("shows a Work-root dense outcome list grouped by Work Folder with framing lines", async () => {
    const { screen } = renderAt("/work");
    const main = screen.getByRole("main");

    await expect.element(main.getByRole("heading", { name: /^All work$/i })).toBeVisible();
    await expect
      .element(main.getByText(/Here's the work — what shipped and what it changed\./i))
      .toBeVisible();
    await expect.element(main.getByText(/^Labor Solutions$/i)).toBeVisible();
    await expect
      .element(main.getByText(/Labor Solutions · Senior Frontend · reporting & survey product UI/i))
      .toBeVisible();
    await expect
      .element(main.getByText(/Advance Auto Parts · Frontend Engineer · store KPI & ML ops/i))
      .toBeVisible();
    await expect.element(main.getByText(/Prototypes · Solo · public demos/i)).toBeVisible();
    await expect.element(main.getByText(/Tools · Solo · browser-local utilities/i)).toBeVisible();
    await expect.element(main.getByText(/^Prototypes$/i)).toBeVisible();
    await expect.element(main.getByText(/^Tools$/i)).toBeVisible();
    await expect.element(main.getByRole("link", { name: /SupplyChain\+/i })).toBeVisible();
    await expect.element(main.getByRole("link", { name: /Snap2Paper/i })).toBeVisible();
    await expect.element(main.getByText(/store KPI measurement UI/i)).toBeVisible();
    await expect.element(main.getByText(ENGAGE_CASE.outcomes[0]!.text)).toBeVisible();
    await expect.element(main.getByText(INDICATOR_BANK_CASE.outcomes[0]!.text)).toBeVisible();
    const rail = screen.getByRole("complementary", { name: /^details$/i });
    await expect.element(rail).not.toHaveTextContent(/Context follows the active Mode/i);
    await expect.element(rail.getByRole("heading", { name: /^Open to roles$/i })).toBeVisible();
    await expect.element(rail.getByRole("link", { name: /^Get in touch$/i })).toBeVisible();
  });

  it("shows media thumbs on All work index rows when cases have media", async () => {
    const { screen } = renderAt("/work");
    const row = screen.getByRole("main").getByRole("link", { name: /SupplyChain\+.*Prototype/i });
    await expect.element(row).toBeVisible();
    const thumb = row.element().querySelector("img");
    expect(thumb).toBeTruthy();
    expect(thumb?.getAttribute("src")).toBeTruthy();
    expect(thumb?.getAttribute("alt")).toBe("");
    expect(thumb?.classList.contains("object-cover")).toBe(true);
    expect(thumb?.classList.contains("object-left-top")).toBe(true);
  });

  it("omits a duplicate All work row from the left Work tree", async () => {
    const { screen } = renderAt("/");
    const tree = screen.getByRole("navigation", { name: /work tree/i });
    await expect.element(tree).toBeVisible();
    await expect.element(tree.getByRole("link", { name: /^All work$/i })).not.toBeInTheDocument();
  });

  it("navigates to the Work Case URL when an All work index row is selected", async () => {
    const { history, screen } = renderAt("/work");

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
    const rail = screen.getByRole("complementary", { name: /^details$/i });
    await expect.element(rail).toBeVisible();

    await expect.element(rail.getByRole("heading", { name: /^Open to roles$/i })).toBeVisible();
    await expect.element(rail.getByText(/^Live$/i)).toBeVisible();
    await expect.element(rail.getByText(/^Role$/i)).toBeVisible();
    await expect.element(rail.getByText(/^Outcomes$/i)).toBeVisible();
    await expect.element(rail.getByText(/^Stack$/i)).toBeVisible();
    await expect.element(rail.getByRole("link", { name: /^Get in touch$/i })).toBeVisible();

    const text = rail.element().textContent ?? "";
    const markers = ["Open to roles", "Live", "Role", "Outcomes", "Stack"];
    let previous = -1;
    for (const marker of markers) {
      const index = text.indexOf(marker);
      expect(index, `expected "${marker}" after prior sections`).toBeGreaterThan(previous);
      previous = index;
    }
  });

  it("keeps Stack expanded without a collapse control", async () => {
    const { screen } = renderAt("/work/labor-solutions/engage-reporting");
    const rail = screen.getByRole("complementary", { name: /^details$/i });
    await expect.element(rail).toBeVisible();
    await expect.element(rail.getByText(/^Stack$/i)).toBeVisible();
    await expect.element(rail.getByText(/^Metabase Embedding SDK$/i)).toBeVisible();
    await expect.element(rail.getByRole("button", { name: /stack/i })).not.toBeInTheDocument();
  });

  it("updates Context Rail body when the active Work Case changes", async () => {
    const { history, screen } = renderAt("/work/labor-solutions/engage-reporting");
    const rail = screen.getByRole("complementary", { name: /^details$/i });
    await expect.element(rail).toBeVisible();
    await expect.element(rail).toHaveTextContent(/Engage reporting/i);
    await expect.element(rail.getByText(/^Live$/i)).not.toBeInTheDocument();
    await expect.element(rail).toHaveTextContent(/Labor Solutions/i);

    await screen.getByRole("link", { name: /SupplyChain\+/i }).click();
    expect(history.get()).toBe(SUPPLY_CHAIN_PATH);
    await expect.element(rail).toHaveTextContent(/SupplyChain\+/i);
    await expect.element(rail).toHaveTextContent(/sc-plus\.vercel\.app/i);
    await expect.element(rail.getByText(/^Live$/i)).toBeVisible();
    await expect.element(rail).not.toHaveTextContent(/Engage reporting/i);
  });

  it("keeps Context Rail in the Triptych Dock collapse model", async () => {
    const { screen } = renderAt("/work/tools/snap2paper");
    await expect.element(screen.getByRole("complementary", { name: /^details$/i })).toBeVisible();
    await expect
      .element(screen.getByRole("complementary", { name: /^details$/i }))
      .toHaveTextContent(/Snap2Paper/i);

    await screen.getByRole("button", { name: /collapse details/i }).click();
    await expect
      .element(screen.getByRole("complementary", { name: /^details$/i }))
      .not.toBeInTheDocument();

    await screen.getByRole("button", { name: /expand details/i }).click();
    await expect.element(screen.getByRole("complementary", { name: /^details$/i })).toBeVisible();
    await expect
      .element(screen.getByRole("complementary", { name: /^details$/i }))
      .toHaveTextContent(/Snap2Paper/i);
  });

  it("omits Outputs and Sources product labels from the Context Rail", async () => {
    const { screen } = renderAt("/work/prototypes/qgenai");
    const rail = screen.getByRole("complementary", { name: /^details$/i });
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

  it("shows dossier composition with proof-first outcomes above wired media for Engage", async () => {
    const { screen } = renderAt("/work/labor-solutions/engage-reporting");
    const stage = screen.getByRole("main");

    await expect.element(stage).toHaveTextContent(ENGAGE_CASE.lede!);
    await expect.element(stage.getByRole("note")).toHaveTextContent(/Internal \/ auth-walled/i);
    await expect.element(stage.getByRole("list", { name: /^Outcomes$/i })).toBeVisible();
    await expect.element(stage.getByRole("region", { name: /^Artifacts$/i })).toBeVisible();
    await expect.element(stage).toHaveTextContent(/Problem → fix/i);
    await expect.element(stage).toHaveTextContent(/What shipped/i);
    await expect.element(stage).toHaveTextContent(ENGAGE_CASE.outcomes[1]!.text);
    await expect.element(stage).toHaveTextContent(ENGAGE_CASE.outcomes[0]!.text);
    await expect.element(stage).not.toHaveTextContent(/43 tracked tickets/i);

    const outcomes = stage.getByRole("list", { name: /^Outcomes$/i }).element();
    const artifacts = stage.getByRole("region", { name: /^Artifacts$/i }).element();
    const carousel = await expectWiredCaseMedia(stage, /Shot 1 · Shell/i);
    expect(
      outcomes.compareDocumentPosition(artifacts) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      artifacts.compareDocumentPosition(carousel.element()) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    await expect.element(stage).not.toHaveTextContent(/redacted/i);
  });

  it("omits Live and Preview without a public URL", async () => {
    const { screen } = renderAt("/work/labor-solutions/engage-reporting");
    const rail = screen.getByRole("complementary", { name: /^details$/i });

    await expect
      .element(screen.getByRole("button", { name: /^Preview$/i }))
      .not.toBeInTheDocument();
    await expect
      .element(screen.getByRole("dialog", { name: /^Preview$/i }))
      .not.toBeInTheDocument();

    await expect.element(rail.getByText(/^Live$/i)).not.toBeInTheDocument();
    await expect.element(rail.getByRole("link", { name: /open live/i })).not.toBeInTheDocument();
    await expect.element(rail).not.toHaveTextContent(/Auth-walled · no public URL/i);
    await expect.element(rail.getByRole("link", { name: /https?:\/\//i })).not.toBeInTheDocument();
  });

  it("binds Context Rail Role/Outcomes/Stack in Work order for Engage without Live", async () => {
    const { screen } = renderAt("/work/labor-solutions/engage-reporting");
    const rail = screen.getByRole("complementary", { name: /^details$/i });

    await expect.element(rail.getByRole("heading", { name: /^Open to roles$/i })).toBeVisible();
    await expect.element(rail.getByText(/^Live$/i)).not.toBeInTheDocument();
    await expect.element(rail.getByText(/^Role$/i)).toBeVisible();
    await expect.element(rail.getByText(/^Outcomes$/i)).toBeVisible();
    await expect.element(rail.getByText(/^Stack$/i)).toBeVisible();
    await expect.element(rail).toHaveTextContent(ENGAGE_CASE.role);
    await expect.element(rail).toHaveTextContent(ENGAGE_CASE.outcomes[1]!.text);
    await expect.element(rail.getByText(/^Metabase Embedding SDK$/i)).toBeVisible();

    const text = rail.element().textContent ?? "";
    const markers = ["Open to roles", "Role", "Outcomes", "Stack"];
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
    const rail = screen.getByRole("complementary", { name: /^details$/i });

    await expect.element(stage).toHaveTextContent(ENGAGE_CASE.outcomes[0]!.text);
    await expect.element(rail).toHaveTextContent(ENGAGE_CASE.outcomes[0]!.text);
    await expect.element(stage).not.toHaveTextContent(/71\.47/i);
    await expect.element(rail).not.toHaveTextContent(/71\.47/i);
    await expect.element(stage).not.toHaveTextContent(/29%→9%/i);
    await expect.element(rail).not.toHaveTextContent(/29%→9%/i);
    await expect.element(stage).not.toHaveTextContent(/124 PRs/i);
    await expect.element(rail).not.toHaveTextContent(/124 PRs/i);
    await expect.element(stage).not.toHaveTextContent(/\(stub\)/i);
    await expect.element(rail).not.toHaveTextContent(/\(stub\)/i);
  });

  it("accents Outcome lead-labels before claim text on stage and Context Rail", async () => {
    const { screen } = renderAt("/work/labor-solutions/engage-reporting");
    const stage = screen.getByRole("main");
    const rail = screen.getByRole("complementary", { name: /^details$/i });
    const [parity, depth] = ENGAGE_CASE.outcomes;

    const stageOutcomes = stage.getByRole("list", { name: /^Outcomes$/i });
    await expect.element(stageOutcomes.getByText(parity!.label, { exact: true })).toBeVisible();
    await expect.element(stageOutcomes.getByText(parity!.text)).toBeVisible();
    await expect.element(stageOutcomes.getByText(depth!.label, { exact: true })).toBeVisible();
    await expect.element(stageOutcomes.getByText(depth!.text)).toBeVisible();

    const railOutcomes = rail.getByRole("list", { name: /^Outcomes$/i });
    await expect.element(railOutcomes.getByText(parity!.label, { exact: true })).toBeVisible();
    await expect.element(railOutcomes.getByText(parity!.text)).toBeVisible();
    await expect.element(railOutcomes.getByText(depth!.label, { exact: true })).toBeVisible();
    await expect.element(railOutcomes.getByText(depth!.text)).toBeVisible();
  });
});

const internalDossierCases = [
  {
    path: "/work/labor-solutions/indicator-bank",
    title: /^Indicator Bank$/i,
    article: /Indicator Bank Internal Dossier/i,
    folder: /Labor Solutions/i,
    claim: INDICATOR_BANK_CASE.outcomes[0]!.text,
    stack: /^Django$/i,
    firstShot: /Shot 1 · Indicators/i,
    forbidden: [/OKR at 1\.0/i, /WPM-3219/i, /71\.47/i, /29%→9%/i, /124 PRs/i],
  },
  {
    path: "/work/advance-auto-parts/measurement-framework",
    title: /^Measurement Framework$/i,
    article: /Measurement Framework Internal Dossier/i,
    folder: /Advance Auto Parts/i,
    claim: /store KPI measurement UI/i,
    stack: /^Snowflake$/i,
    firstShot: /Shot 1 · Topsheet/i,
    forbidden: [/owned the/i, /redacted/i],
  },
  {
    path: "/work/advance-auto-parts/model-deployment-framework",
    title: /^Model Deployment Framework$/i,
    article: /Model Deployment Framework Internal Dossier/i,
    folder: /Advance Auto Parts/i,
    claim: /self-service ML model hosting/i,
    stack: /^Tailwind CSS$/i,
    firstShot: /Shot 1 · Home/i,
    forbidden: [/owned the/i, /redacted/i],
  },
  {
    path: "/work/advance-auto-parts/store-dashboard",
    title: /^Store Dashboard$/i,
    article: /Store Dashboard Internal Dossier/i,
    folder: /Advance Auto Parts/i,
    claim: /actual vs predicted/i,
    stack: /^Streamlit$/i,
    firstShot: /Shot 1 · Performance/i,
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

    it(`omits Live and Preview without a public URL for ${dossier.path}`, async () => {
      const { screen } = renderAt(dossier.path);
      const rail = screen.getByRole("complementary", { name: /^details$/i });

      await expect
        .element(screen.getByRole("button", { name: /^Preview$/i }))
        .not.toBeInTheDocument();
      await expect
        .element(screen.getByRole("dialog", { name: /^Preview$/i }))
        .not.toBeInTheDocument();

      await expect.element(rail.getByText(/^Live$/i)).not.toBeInTheDocument();
      await expect.element(rail.getByRole("link", { name: /open live/i })).not.toBeInTheDocument();
      await expect.element(rail).not.toHaveTextContent(/Auth-walled · no public URL/i);
      await expect
        .element(rail.getByRole("link", { name: /https?:\/\//i }))
        .not.toBeInTheDocument();
    });

    it(`shows dossier composition with Public Claims and wired media for ${dossier.path}`, async () => {
      const { screen } = renderAt(dossier.path);
      const stage = screen.getByRole("main");
      const rail = screen.getByRole("complementary", { name: /^details$/i });

      await expect.element(stage.getByRole("note")).toHaveTextContent(/Internal \/ auth-walled/i);
      await expect.element(stage.getByRole("list", { name: /^Outcomes$/i })).toBeVisible();
      await expect.element(stage.getByRole("region", { name: /^Artifacts$/i })).toBeVisible();
      await expect.element(stage).toHaveTextContent(/What shipped/i);
      await expect.element(stage).toHaveTextContent(dossier.claim);
      await expect.element(rail).toHaveTextContent(dossier.claim);
      await expect.element(rail.getByText(dossier.stack)).toBeVisible();

      const outcomes = stage.getByRole("list", { name: /^Outcomes$/i }).element();
      const artifacts = stage.getByRole("region", { name: /^Artifacts$/i }).element();
      const carousel = await expectWiredCaseMedia(stage, dossier.firstShot);
      expect(
        outcomes.compareDocumentPosition(artifacts) & Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
      expect(
        artifacts.compareDocumentPosition(carousel.element()) & Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
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
    const rail = screen.getByRole("complementary", { name: /^details$/i });
    await expect.element(rail.getByRole("heading", { name: /^Open to roles$/i })).toBeVisible();
    await expect.element(rail.getByText(/^Facts$/i)).toBeVisible();
    await expect.element(rail.getByText(/^Elsewhere$/i)).toBeVisible();
    await expect.element(rail).not.toHaveTextContent(/sc-plus\.vercel\.app/i);
  });
});

describe("Public Storefront SupplyChain+ (App Shell seam)", () => {
  afterEach(() => cleanup());

  it("keeps center proof-first with rewritten lede and outcomes above media", async () => {
    const { screen } = renderAt(SUPPLY_CHAIN_PATH);
    const stage = screen.getByRole("main");
    await expect.element(stage.getByRole("heading", { name: /^SupplyChain\+$/i })).toBeVisible();
    await expect.element(stage).toHaveTextContent(SUPPLY_CHAIN_CASE.lede!);

    const text = stage.element().textContent ?? "";
    const outcomesIndex = text.indexOf(SUPPLY_CHAIN_CASE.outcomes[0]!.text);
    const mediaIndex = text.search(/Shot 1/i);
    expect(outcomesIndex).toBeGreaterThan(-1);
    expect(mediaIndex).toBeGreaterThan(outcomesIndex);
  });

  it("accents Outcome lead-labels before claim text on stage and Context Rail", async () => {
    const { screen } = renderAt(SUPPLY_CHAIN_PATH);
    const stage = screen.getByRole("main");
    const rail = screen.getByRole("complementary", { name: /^details$/i });
    const [craft, ai] = SUPPLY_CHAIN_CASE.outcomes;

    const stageOutcomes = stage.getByRole("list", { name: /^Outcomes$/i });
    await expect.element(stageOutcomes.getByText(craft!.label, { exact: true })).toBeVisible();
    await expect.element(stageOutcomes.getByText(craft!.text)).toBeVisible();
    await expect.element(stageOutcomes.getByText(ai!.label, { exact: true })).toBeVisible();
    await expect.element(stageOutcomes.getByText(ai!.text)).toBeVisible();

    const railOutcomes = rail.getByRole("list", { name: /^Outcomes$/i });
    await expect.element(railOutcomes.getByText(craft!.label, { exact: true })).toBeVisible();
    await expect.element(railOutcomes.getByText(craft!.text)).toBeVisible();
    await expect.element(railOutcomes.getByText(ai!.label, { exact: true })).toBeVisible();
    await expect.element(railOutcomes.getByText(ai!.text)).toBeVisible();
  });

  it("shows Prototype badge and primary Open live with muted host", async () => {
    const { screen } = renderAt(SUPPLY_CHAIN_PATH);
    const stage = screen.getByRole("main");
    const rail = screen.getByRole("complementary", { name: /^details$/i });

    await expect.element(stage.getByText(/^Prototype$/i)).toBeVisible();
    const openLive = rail.getByRole("link", { name: /open live/i });
    await expect.element(openLive).toBeVisible();
    expect(openLive.element().getAttribute("href")).toBe("https://sc-plus.vercel.app");
    expect(openLive.element().getAttribute("target")).toBe("_blank");
    await expect.element(rail).toHaveTextContent(/sc-plus\.vercel\.app/i);
    await expect
      .element(rail.getByRole("link", { name: /^sc-plus\.vercel\.app$/i }))
      .not.toBeInTheDocument();
  });

  it("binds Context Rail Live/Role/Outcomes/Stack to SupplyChain+", async () => {
    const { screen } = renderAt(SUPPLY_CHAIN_PATH);
    const rail = screen.getByRole("complementary", { name: /^details$/i });
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
    const rail = screen.getByRole("complementary", { name: /^details$/i });

    await expect.element(stage).toHaveTextContent(SUPPLY_CHAIN_CASE.outcomes[0]!.text);
    await expect.element(rail).toHaveTextContent(SUPPLY_CHAIN_CASE.outcomes[0]!.text);
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
      .element(screen.getByRole("complementary", { name: /^details$/i }))
      .toHaveTextContent(/sc-plus\.vercel\.app/i);
  });
});

describe("Public Storefront carousel and Live (App Shell seam)", () => {
  afterEach(() => cleanup());

  it("uses a stage carousel with wired inventory images for Public Storefront media", async () => {
    const { screen } = renderAt(SUPPLY_CHAIN_PATH);
    const stage = screen.getByRole("main");
    const carousel = await expectWiredCaseMedia(stage, /Shot 1 · Home/i);

    await expect.element(carousel).toHaveTextContent(/Shot 1/i);
    await expect.element(stage).not.toHaveTextContent(/media placeholder/i);

    await carousel.getByRole("button", { name: /next/i }).click();
    await expect.element(carousel).toHaveTextContent(/Shot 2/i);
    await expect.element(carousel.getByRole("img", { name: /Shot 2 · Diagnosis/i })).toBeVisible();
  });

  it("has no Preview chip or Preview overlay on Public Storefront or Internal Dossier", async () => {
    const storefront = renderAt(SUPPLY_CHAIN_PATH);
    await expect
      .element(storefront.screen.getByRole("button", { name: /^Preview$/i }))
      .not.toBeInTheDocument();
    await expect
      .element(storefront.screen.getByRole("dialog", { name: /^Preview$/i }))
      .not.toBeInTheDocument();

    cleanup();
    const dossier = renderAt("/work/labor-solutions/engage-reporting");
    await expect
      .element(dossier.screen.getByRole("button", { name: /^Preview$/i }))
      .not.toBeInTheDocument();
    await expect
      .element(dossier.screen.getByRole("dialog", { name: /^Preview$/i }))
      .not.toBeInTheDocument();
  });

  it("contains stage carousel shots on a muted deep backdrop without slideTone gradients", async () => {
    const { screen } = renderAt(SUPPLY_CHAIN_PATH);
    const carousel = await expectWiredCaseMedia(screen.getByRole("main"), /Shot 1 · Home/i);
    const shot = carousel.getByRole("img", { name: /Shot 1 · Home/i }).element();

    expect(shot.classList.contains("object-contain")).toBe(true);
    expect(shot.classList.contains("object-cover")).toBe(false);

    const slide = shot.closest("[data-case-media-slide]");
    expect(slide).toBeTruthy();
    expect(slide!.classList.contains("bg-bg-deep")).toBe(true);
    expect(slide!.className).not.toMatch(/radial-gradient|linear-gradient/);
  });

  it("opens a shared fullscreen media viewer from the stage slide and closes without pointer-only traps", async () => {
    const { screen } = renderAt(SUPPLY_CHAIN_PATH);
    const carousel = await expectWiredCaseMedia(screen.getByRole("main"), /Shot 1 · Home/i);

    await expect
      .element(screen.getByRole("dialog", { name: /media viewer/i }))
      .not.toBeInTheDocument();

    const openFullscreen = carousel.getByRole("button", {
      name: /view shot 1 · home fullscreen/i,
    });
    await expect.element(openFullscreen).toBeVisible();
    await openFullscreen.click();
    const viewer = screen.getByRole("dialog", { name: /media viewer/i });
    await expect.element(viewer).toBeVisible();
    await expect.element(viewer.getByRole("img", { name: /Shot 1 · Home/i })).toBeVisible();

    const close = viewer.getByRole("button", { name: /close media viewer/i });
    await expect.element(close).toBeVisible();
    await close.click();
    await expect.element(viewer).not.toBeInTheDocument();

    await openFullscreen.click();
    await expect.element(screen.getByRole("dialog", { name: /media viewer/i })).toBeVisible();
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    await expect
      .element(screen.getByRole("dialog", { name: /media viewer/i }))
      .not.toBeInTheDocument();
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
    claim: /printable grid layouts/i,
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
      const rail = screen.getByRole("complementary", { name: /^details$/i });

      await expect.element(stage.getByRole("heading", { name: storefront.title })).toBeVisible();
      await expect.element(stage.getByText(storefront.badge)).toBeVisible();
      await expect.element(stage.getByRole("article", { name: storefront.article })).toBeVisible();
      await expect.element(stage).not.toHaveTextContent(/Work Case · .* \(stub\)/i);

      const openLive = rail.getByRole("link", { name: /open live/i });
      await expect.element(openLive).toBeVisible();
      expect(openLive.element().getAttribute("href")).toBe(storefront.liveHref);
      expect(openLive.element().getAttribute("target")).toBe("_blank");
      await expect.element(rail).toHaveTextContent(storefront.liveLabel);
      await expect
        .element(screen.getByRole("button", { name: /^Preview$/i }))
        .not.toBeInTheDocument();
    });

    it(`keeps wired carousel without Preview for ${storefront.path}`, async () => {
      const { screen } = renderAt(storefront.path);
      const stage = screen.getByRole("main");
      const carousel = await expectWiredCaseMedia(stage, /Shot 1/i);

      await expect.element(carousel).toHaveTextContent(/Shot 1/i);
      await carousel.getByRole("button", { name: /next/i }).click();
      await expect.element(carousel).toHaveTextContent(/Shot 2/i);

      await expect
        .element(screen.getByRole("button", { name: /^Preview$/i }))
        .not.toBeInTheDocument();
      await expect
        .element(screen.getByRole("dialog", { name: /^Preview$/i }))
        .not.toBeInTheDocument();
    });

    it(`surfaces Public Claims in center and Context Rail for ${storefront.path}`, async () => {
      const { screen } = renderAt(storefront.path);
      const stage = screen.getByRole("main");
      const rail = screen.getByRole("complementary", { name: /^details$/i });

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
          /Senior Frontend Engineer · React \/ Next\.js · Complex product UI \(reporting, forms, platform\)/i,
        ),
      )
      .toBeVisible();
    await expect
      .element(
        stage.getByText(
          /7\+ years building complex React\/Next\.js product UI for remote teams — 13\+ years total/i,
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

  it("shows Hire Signal soft panel, Facts, and Elsewhere in Context Rail order", async () => {
    const { screen } = renderAt("/about");
    const rail = screen.getByRole("complementary", { name: /^details$/i });
    await expect.element(rail).toBeVisible();

    await expect.element(rail.getByRole("heading", { name: /^Open to roles$/i })).toBeVisible();
    await expect.element(rail.getByRole("link", { name: /^Get in touch$/i })).toBeVisible();
    await expect.element(rail.getByText(/^Facts$/i)).toBeVisible();
    await expect.element(rail.getByText(/^Elsewhere$/i)).toBeVisible();
    await expect.element(rail.getByText(/Punjab · remote/i)).toBeVisible();
    await expect.element(rail.getByText(/13\+ yrs/i)).toBeVisible();
    await expect.element(rail.getByText("Complex product UI", { exact: true })).toBeVisible();
    await expect.element(rail.getByRole("link", { name: /Resume \(PDF\)/i })).toBeVisible();
    await expect.element(rail.getByRole("link", { name: /^LinkedIn/i })).toBeVisible();
    await expect.element(rail.getByRole("link", { name: /^GitHub/i })).toBeVisible();

    const text = rail.element().textContent ?? "";
    const markers = ["Open to roles", "Facts", "Elsewhere"];
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
    await expect
      .element(stage.getByText(/Drop me a note\. Email and LinkedIn are also in the side panel\./i))
      .toBeVisible();
    await expect.element(stage).not.toHaveTextContent(/Context Rail/i);
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

  it("shows the soft hire panel plus email / LinkedIn / GitHub / CV in the Context Rail", async () => {
    const { screen } = renderAt("/contact");
    const rail = screen.getByRole("complementary", { name: /^details$/i });

    await expect.element(rail.getByRole("heading", { name: /^Open to roles$/i })).toBeVisible();
    await expect.element(rail).toHaveTextContent(/Senior Frontend · Complex product UI · remote/i);
    await expect
      .element(rail.getByRole("link", { name: /^Get in touch$/i }))
      .not.toBeInTheDocument();
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
    const markers = ["Open to roles", "Quick links"];
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
    const rail = screen.getByRole("complementary", { name: /^details$/i });

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
      .element(screen.getByRole("complementary", { name: /^details$/i }))
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

  it("applies theme-token scroll surfaces on mobile stage, drawer, and Context sheet", async () => {
    await setMobileViewport();
    const { screen } = renderAt("/");

    const stage = screen.getByRole("main");
    await expect.element(stage).toBeVisible();
    expect(stage.element().classList.contains("vk-scroll")).toBe(true);

    await screen.getByRole("button", { name: /open navigation/i }).click();
    const drawer = screen.getByRole("dialog", { name: /navigation/i });
    await expect.element(drawer).toBeVisible();
    expect(drawer.element().classList.contains("vk-scroll")).toBe(true);

    await screen.getByRole("button", { name: /dismiss overlay/i }).click();
    await screen.getByRole("button", { name: /open context/i }).click();
    const sheet = screen.getByRole("dialog", { name: /^Context$/i });
    await expect.element(sheet).toBeVisible();
    expect(sheet.element().classList.contains("vk-scroll")).toBe(true);
  });

  it("opens Context Rail content as a sheet from ···, full-screen when dense", async () => {
    await setMobileViewport();
    const { screen } = renderAt(SUPPLY_CHAIN_PATH);

    await screen.getByRole("button", { name: /open context/i }).click();
    const sheet = screen.getByRole("dialog", { name: /context/i });
    await expect.element(sheet).toBeVisible();
    expect(sheet.element().getAttribute("data-dense")).toBe("");
    await expect.element(sheet.getByText(/^Live$/i)).toBeVisible();
    await expect.element(sheet.getByRole("link", { name: /open live/i })).toBeVisible();
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
    await expect
      .element(aboutSheet.getByRole("heading", { name: /^Open to roles$/i }))
      .toBeVisible();
    await expect.element(aboutSheet.getByText(/^Facts$/i)).toBeVisible();
  });

  it("shows Mode title only in the mobile header (no folder/case crumb trail)", async () => {
    await setMobileViewport();
    const { screen } = renderAt("/");

    await expect
      .element(screen.getByRole("banner").getByRole("heading", { name: /^About$/i }))
      .toBeVisible();
    await expect
      .element(screen.getByRole("navigation", { name: /breadcrumb/i }))
      .not.toBeInTheDocument();
    await expect.element(screen.getByRole("banner")).not.toHaveTextContent(/SupplyChain\+/i);

    cleanup();
    const storefront = renderAt(SUPPLY_CHAIN_PATH);
    await expect
      .element(storefront.screen.getByRole("banner").getByRole("heading", { name: /^Work$/i }))
      .toBeVisible();
    await expect
      .element(storefront.screen.getByRole("banner"))
      .not.toHaveTextContent(/Prototypes/i);
    await expect
      .element(storefront.screen.getByRole("banner"))
      .not.toHaveTextContent(/SupplyChain\+/i);

    cleanup();
    const dossier = renderAt("/work/labor-solutions/engage-reporting");
    await expect
      .element(dossier.screen.getByRole("banner").getByRole("heading", { name: /^Work$/i }))
      .toBeVisible();
    await expect
      .element(dossier.screen.getByRole("banner"))
      .not.toHaveTextContent(/Labor Solutions/i);
    await expect
      .element(dossier.screen.getByRole("banner"))
      .not.toHaveTextContent(/Engage reporting/i);
  });

  it("has no Preview entry point on mobile Public Storefront or Internal Dossier", async () => {
    await setMobileViewport();
    const { screen } = renderAt(SUPPLY_CHAIN_PATH);

    await expect
      .element(screen.getByRole("button", { name: /^Preview$/i }))
      .not.toBeInTheDocument();
    await expect
      .element(screen.getByRole("dialog", { name: /^Preview$/i }))
      .not.toBeInTheDocument();

    cleanup();
    const dossier = renderAt("/work/labor-solutions/engage-reporting");
    await expect
      .element(dossier.screen.getByRole("button", { name: /^Preview$/i }))
      .not.toBeInTheDocument();
    await expect
      .element(dossier.screen.getByRole("dialog", { name: /^Preview$/i }))
      .not.toBeInTheDocument();
  });

  it("opens the shared fullscreen media viewer from a stage slide on mobile", async () => {
    await setMobileViewport();
    const { screen } = renderAt(SUPPLY_CHAIN_PATH);
    const carousel = await expectWiredCaseMedia(screen.getByRole("main"), /Shot 1 · Home/i);

    await carousel.getByRole("button", { name: /view shot 1 · home fullscreen/i }).click();
    const viewer = screen.getByRole("dialog", { name: /media viewer/i });
    await expect.element(viewer).toBeVisible();
    await expect.element(viewer.getByRole("img", { name: /Shot 1 · Home/i })).toBeVisible();

    await viewer.getByRole("button", { name: /close media viewer/i }).click();
    await expect.element(viewer).not.toBeInTheDocument();
  });
});

describe("Hire Signal (App Shell seam)", () => {
  afterEach(async () => {
    cleanup();
    setHireSignalEnabledForTests(undefined);
    localStorage.removeItem(HIRE_SIGNAL_SNOOZE_KEY);
    await restoreDesktopViewport();
  });

  it("shows desktop soft Hire Signal panel and mobile Open to roles chip when the flag is on", async () => {
    setHireSignalEnabledForTests(true);
    const desktop = renderAt(SUPPLY_CHAIN_PATH);
    const rail = desktop.screen.getByRole("complementary", { name: /^details$/i });
    await expect.element(rail.getByRole("heading", { name: /^Open to roles$/i })).toBeVisible();
    await expect.element(rail.getByRole("link", { name: /^Get in touch$/i })).toBeVisible();
    await expect.element(rail).toHaveTextContent(/Senior Frontend · Complex product UI · remote/i);
    cleanup();

    await setMobileViewport();
    const mobile = renderAt("/");
    await expect
      .element(mobile.screen.getByRole("button", { name: /^Open to roles$/i }))
      .toBeVisible();
  });

  it("keeps one Hire Signal detail body on Work and About rails", async () => {
    setHireSignalEnabledForTests(true);
    const work = renderAt(SUPPLY_CHAIN_PATH);
    const workRail = work.screen.getByRole("complementary", { name: /^details$/i });
    await expect
      .element(workRail)
      .toHaveTextContent(/Senior Frontend · Complex product UI · remote/i);
    cleanup();

    const about = renderAt("/about");
    const aboutRail = about.screen.getByRole("complementary", { name: /^details$/i });
    await expect
      .element(aboutRail)
      .toHaveTextContent(/Senior Frontend · Complex product UI · remote/i);
  });

  it("hides both Hire Signal surfaces when the flag is off", async () => {
    setHireSignalEnabledForTests(false);
    const desktop = renderAt(SUPPLY_CHAIN_PATH);
    const rail = desktop.screen.getByRole("complementary", { name: /^details$/i });
    await expect.element(rail.getByText(/^Live$/i)).toBeVisible();
    await expect
      .element(rail.getByRole("heading", { name: /^Open to roles$/i }))
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
    await expect
      .element(screen.getByText("Senior FE · Complex product UI · remote", { exact: true }))
      .toBeVisible();
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
    const rail = desktop.screen.getByRole("complementary", { name: /^details$/i });
    await expect.element(rail.getByRole("link", { name: /get in touch/i })).toBeVisible();
  });

  it("keeps Contact Mode, form, and quick links available when Hire Signal is off", async () => {
    setHireSignalEnabledForTests(false);
    const { screen } = renderAt("/contact");
    const stage = screen.getByRole("main");
    const rail = screen.getByRole("complementary", { name: /^details$/i });

    await expect.element(stage.getByRole("heading", { name: /^Get in touch$/i })).toBeVisible();
    await expect.element(stage.getByLabelText(/^Name$/i)).toBeVisible();
    await expect.element(stage.getByLabelText(/^Email$/i)).toBeVisible();
    await expect.element(stage.getByLabelText(/^Message$/i)).toBeVisible();
    await expect.element(rail.getByRole("heading", { name: /^Open to roles$/i })).toBeVisible();
    await expect.element(rail.getByRole("link", { name: /^Email/i })).toBeVisible();
    await expect.element(rail.getByRole("link", { name: /^LinkedIn/i })).toBeVisible();
    await expect.element(rail.getByRole("link", { name: /^GitHub/i })).toBeVisible();
    await expect.element(rail.getByRole("link", { name: /^CV/i })).toBeVisible();
  });
});
