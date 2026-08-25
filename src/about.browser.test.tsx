import { cleanup, render } from "@solidjs/testing-library";
import { createMemoryHistory, MemoryRouter, Route } from "@solidjs/router";
import { afterEach, describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import { AppShellRoutes } from "./app";
import { SelectedWorkPeekList, type SelectedWorkView } from "./stages/about-stage";

const MOBILE_VIEWPORT = { width: 390, height: 844 } as const;
const DESKTOP_VIEWPORT = { width: 1280, height: 800 } as const;

const GLYPH_PEEK: SelectedWorkView = {
  href: "/work/fixture/no-media",
  title: "No Media Case",
  blurb: "First outcome blurb for the glyph peek.",
  meta: "Fixture",
};

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

function renderPeekList(views: readonly SelectedWorkView[]) {
  const result = render(() => (
    <MemoryRouter>
      <Route path="/" component={() => <SelectedWorkPeekList views={views} />} />
    </MemoryRouter>
  ));
  return { ...result, screen: page.elementLocator(result.baseElement) };
}

function selectedWorkList(screen: ReturnType<typeof renderAt>["screen"]) {
  return screen.getByRole("main").getByRole("region", { name: /^Selected work$/i });
}

function expectGlyphPlate(plate: Element, heightPx: string) {
  expect(plate.querySelector("img")).toBeNull();
  expect(plate.querySelector("svg")).toBeTruthy();
  expect(getComputedStyle(plate).height).toBe(heightPx);
  expect(getComputedStyle(plate).borderStyle).toBe("dashed");
  expect(getComputedStyle(plate).backgroundImage).toBe("none");
  expect(plate.textContent?.replace(/\s+/g, "")).toBe("");
  const parent = plate.parentElement;
  expect(parent).toBeTruthy();
  expect(plate.getBoundingClientRect().width).toBeGreaterThan(parent!.clientWidth * 0.9);
}

describe("Densified About Selected work (App Shell seam)", () => {
  afterEach(async () => {
    cleanup();
    await page.viewport(DESKTOP_VIEWPORT.width, DESKTOP_VIEWPORT.height);
  });

  it("shows Selected work trio and All work on /", async () => {
    const { screen, history } = renderAt("/");
    const selected = selectedWorkList(screen);

    await expect.element(selected).toBeVisible();
    const peeks = selected.getByRole("list", { name: /^Selected work$/i }).getByRole("listitem");
    await expect.poll(() => peeks.elements().length).toBe(3);

    for (const title of ["SupplyChain+", "Engage reporting", "Store Dashboard"]) {
      await expect
        .element(selected.getByRole("link", { name: new RegExp(title, "i") }))
        .toBeVisible();
    }
    await expect
      .element(selected.getByRole("link", { name: /^Measurement Framework$/i }))
      .not.toBeInTheDocument();
    await expect
      .element(selected.getByRole("link", { name: /^Indicator Bank$/i }))
      .not.toBeInTheDocument();

    await selected.getByRole("link", { name: /All work/i }).click();
    expect(history.get()).toBe("/work");
    await expect
      .element(screen.getByRole("main").getByRole("heading", { name: /^All work$/i }))
      .toBeVisible();
  });

  it("serves the About stage at /about", async () => {
    const { screen } = renderAt("/about");
    await expect.element(selectedWorkList(screen)).toBeVisible();
    await expect.element(screen.getByRole("heading", { name: /Vishal Kumar/i })).toBeVisible();
    const article = screen.getByRole("article", { name: /about/i });
    await expect.element(article).toBeVisible();
    await expect.element(article.getByText(/vishalk\.com/i)).toBeVisible();
    expect(article.element().textContent?.length ?? 0).toBeGreaterThan(500);
  });

  it("renders Contact with 500+ characters of copy", async () => {
    const { screen } = renderAt("/contact");
    const article = screen.getByRole("article", { name: /contact/i });
    await expect.element(article).toBeVisible();
    expect(article.element().textContent?.length ?? 0).toBeGreaterThan(500);
  });

  it("renders case-crop media in the densify strip at desktop height with cover/left-top crop", async () => {
    await page.viewport(DESKTOP_VIEWPORT.width, DESKTOP_VIEWPORT.height);
    const { screen } = renderAt("/");
    const selected = selectedWorkList(screen);
    await expect.element(selected).toBeVisible();

    const supply = selected.getByRole("link", { name: /SupplyChain\+/i });
    await expect.element(supply).toBeVisible();

    const plate = supply.element().querySelector('[data-selected-work-media="media"]');
    expect(plate).toBeTruthy();
    expect(getComputedStyle(plate!).height).toBe("56px");
    expect(getComputedStyle(plate!).borderStyle).not.toBe("dashed");

    const img = plate!.querySelector("img");
    expect(img).toBeTruthy();
    expect(img!.getAttribute("src")).toBeTruthy();
    expect(img!.getAttribute("alt")).toBe("");
    expect(getComputedStyle(img!).objectFit).toBe("cover");
    expect(getComputedStyle(img!).objectPosition).toMatch(/^(left top|0% 0%)$/);

    expect(supply.element().querySelector('[data-selected-work-media="glyph"]')).toBeNull();
    expect(getComputedStyle(plate!).backgroundImage).toBe("none");
  });

  it("equalizes Selected work peek panel heights on desktop", async () => {
    await page.viewport(DESKTOP_VIEWPORT.width, DESKTOP_VIEWPORT.height);
    const { screen } = renderAt("/");
    const selected = selectedWorkList(screen);
    await expect.element(selected).toBeVisible();

    const list = selected.getByRole("list", { name: /^Selected work$/i }).element();
    const panels = [...list.querySelectorAll(":scope > li > a")];
    expect(panels).toHaveLength(3);

    const heights = panels.map((panel) => panel.getBoundingClientRect().height);
    expect(Math.abs(heights[1]! - heights[0]!)).toBeLessThan(2);
    expect(Math.abs(heights[2]! - heights[0]!)).toBeLessThan(2);
  });

  it("stacks Selected work 1-column on mobile with taller densify media", async () => {
    await page.viewport(MOBILE_VIEWPORT.width, MOBILE_VIEWPORT.height);
    const { screen } = renderAt("/");
    const selected = selectedWorkList(screen);
    await expect.element(selected).toBeVisible();

    const list = selected.getByRole("list", { name: /^Selected work$/i }).element();
    expect(getComputedStyle(list).gridTemplateColumns.split(/\s+/).length).toBe(1);

    const peeks = [...list.querySelectorAll(":scope > li")];
    expect(peeks).toHaveLength(3);
    const tops = peeks.map((peek) => peek.getBoundingClientRect().top);
    const lefts = peeks.map((peek) => peek.getBoundingClientRect().left);
    expect(tops[1]!).toBeGreaterThan(tops[0]!);
    expect(tops[2]!).toBeGreaterThan(tops[1]!);
    expect(Math.abs(lefts[1]! - lefts[0]!)).toBeLessThan(2);
    expect(Math.abs(lefts[2]! - lefts[0]!)).toBeLessThan(2);

    const plate = peeks[0]!.querySelector('[data-selected-work-media="media"]');
    expect(plate).toBeTruthy();
    expect(getComputedStyle(plate!).height).toBe("88px");
  });

  it("keeps a soft dashed glyph plate at densify height when a peek has no media (desktop)", async () => {
    await page.viewport(DESKTOP_VIEWPORT.width, DESKTOP_VIEWPORT.height);
    const { screen } = renderPeekList([GLYPH_PEEK]);
    const peek = screen.getByRole("link", { name: /No Media Case/i });
    await expect.element(peek).toBeVisible();

    const plate = peek.element().querySelector('[data-selected-work-media="glyph"]');
    expect(plate).toBeTruthy();
    expectGlyphPlate(plate!, "56px");
  });

  it("keeps a soft dashed glyph plate at densify height when a peek has no media (mobile)", async () => {
    await page.viewport(MOBILE_VIEWPORT.width, MOBILE_VIEWPORT.height);
    const { screen } = renderPeekList([GLYPH_PEEK]);
    const peek = screen.getByRole("link", { name: /No Media Case/i });
    await expect.element(peek).toBeVisible();

    const plate = peek.element().querySelector('[data-selected-work-media="glyph"]');
    expect(plate).toBeTruthy();
    expectGlyphPlate(plate!, "88px");
  });
});
