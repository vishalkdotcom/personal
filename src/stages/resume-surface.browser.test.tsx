import { cleanup, render } from "@solidjs/testing-library";
import { createMemoryHistory, MemoryRouter } from "@solidjs/router";
import { afterEach, describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import { AppShellRoutes } from "../app";
import { RESUME_PDF_FILENAME, RESUME_PDF_HREF } from "../resume/content";
import { applyResolvedTheme } from "../theme/theme";

const MOBILE_VIEWPORT = { width: 390, height: 844 } as const;
const DESKTOP_VIEWPORT = { width: 1280, height: 800 } as const;

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

function parseRgb(color: string): { r: number; g: number; b: number; a: number } | null {
  const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/i);
  if (!match) return null;
  return {
    r: Number(match[1]),
    g: Number(match[2]),
    b: Number(match[3]),
    a: match[4] === undefined ? 1 : Number(match[4]),
  };
}

function blendOnto(
  fg: { r: number; g: number; b: number; a: number },
  bg: { r: number; g: number; b: number; a: number },
) {
  const a = fg.a + bg.a * (1 - fg.a);
  if (a === 0) return { r: 0, g: 0, b: 0 };
  return {
    r: (fg.r * fg.a + bg.r * bg.a * (1 - fg.a)) / a,
    g: (fg.g * fg.a + bg.g * bg.a * (1 - fg.a)) / a,
    b: (fg.b * fg.a + bg.b * bg.a * (1 - fg.a)) / a,
  };
}

function relativeLuminance({ r, g, b }: { r: number; g: number; b: number }): number {
  const channel = (value: number) => {
    const c = value / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrastRatio(fgColor: string, bgColor: string): number {
  const fg = parseRgb(fgColor);
  const bg = parseRgb(bgColor);
  expect(fg, `parseable foreground ${fgColor}`).toBeTruthy();
  expect(bg, `parseable background ${bgColor}`).toBeTruthy();
  const blended = blendOnto(fg!, { ...bg!, a: 1 });
  const l1 = relativeLuminance(blended);
  const l2 = relativeLuminance(bg!);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

describe("Resume Surface (App Shell seam)", () => {
  afterEach(async () => {
    cleanup();
    document.documentElement.removeAttribute("data-theme");
    await page.viewport(DESKTOP_VIEWPORT.width, DESKTOP_VIEWPORT.height);
  });

  it("embeds the real PDF in a framed shell-owned viewer on /resume", async () => {
    const { screen } = renderAt("/resume");
    const surface = screen.getByRole("main").getByRole("article", { name: /Resume Surface/i });
    const viewer = surface.getByRole("region", { name: /Resume viewer/i });

    await expect.element(viewer).toBeVisible();
    await expect.element(viewer.getByText(RESUME_PDF_FILENAME)).toBeVisible();
    const embed = viewer.getByTitle(/Vishal Kumar resume/i);
    await expect.element(embed).toBeVisible();
    expect(embed.element().getAttribute("src")).toBe(RESUME_PDF_HREF);
  });

  it("keeps the Resume viewer surround readable in light and dark themes", async () => {
    for (const theme of ["light", "dark"] as const) {
      applyResolvedTheme(theme);
      const { screen } = renderAt("/resume");
      const viewer = screen.getByRole("main").getByRole("region", { name: /Resume viewer/i });
      const filename = viewer.getByText(RESUME_PDF_FILENAME);
      await expect.element(filename).toBeVisible();

      const filenameEl = filename.element();
      const toolbar = filenameEl.parentElement;
      expect(toolbar, "expected filename to sit in the viewer toolbar").toBeTruthy();
      const toolbarBg = getComputedStyle(toolbar!).backgroundColor;
      const filenameColor = getComputedStyle(filenameEl).color;
      const wellBg = getComputedStyle(viewer.element()).backgroundColor;

      expect(contrastRatio(filenameColor, toolbarBg)).toBeGreaterThanOrEqual(3);
      expect(wellBg).not.toBe("rgba(0, 0, 0, 0)");
      expect(wellBg).not.toBe(toolbarBg);
      cleanup();
    }
  });

  it("keeps the framed Resume viewer on mobile viewports", async () => {
    await page.viewport(MOBILE_VIEWPORT.width, MOBILE_VIEWPORT.height);
    const { screen } = renderAt("/resume");
    const viewer = screen.getByRole("main").getByRole("region", { name: /Resume viewer/i });

    await expect.element(viewer).toBeVisible();
    await expect.element(viewer.getByText(RESUME_PDF_FILENAME)).toBeVisible();
    await expect.element(viewer.getByTitle(/Vishal Kumar resume/i)).toBeVisible();
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
          /7\+ years on complex React\/Next product UI — reporting, forms, and platform/i,
        ),
      )
      .not.toBeInTheDocument();
    await expect.element(stage).not.toHaveTextContent(/\(stub\)/i);
  });

  it("keeps shell chrome and a thin Context Rail with Hire Signal soft panel and links", async () => {
    const { screen } = renderAt("/resume");

    await expect.element(screen.getByRole("navigation", { name: /modes/i })).toBeVisible();
    await expect.element(screen.getByRole("main")).toBeVisible();

    const rail = screen.getByRole("complementary", { name: /^details$/i });
    await expect.element(rail).toBeVisible();
    await expect.element(rail.getByRole("heading", { name: /^Open to roles$/i })).toBeVisible();
    await expect.element(rail.getByRole("link", { name: /^Get in touch$/i })).toBeVisible();
    await expect.element(rail.getByText(/^Links$/i)).toBeVisible();
    await expect.element(rail.getByText(/^Stack$/i)).not.toBeInTheDocument();
    await expect.element(rail.getByText(/^Skills$/i)).not.toBeInTheDocument();
    await expect.element(rail.getByRole("link", { name: /Download PDF/i })).toBeVisible();
    expect(
      rail
        .getByRole("link", { name: /Download PDF/i })
        .element()
        .getAttribute("href"),
    ).toBe(RESUME_PDF_HREF);
    await expect.element(rail.getByRole("link", { name: /^LinkedIn/i })).toBeVisible();
    await expect.element(rail.getByRole("link", { name: /^GitHub/i })).toBeVisible();
    await expect.element(rail).not.toHaveTextContent(/Context follows the active Mode/i);

    const text = rail.element().textContent ?? "";
    const markers = ["Open to roles", "Links"];
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
