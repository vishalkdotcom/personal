import { cleanup, render } from "@solidjs/testing-library";
import { MemoryRouter, Route } from "@solidjs/router";
import { afterEach, describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import type { WorkFolder } from "../work/inventory";
import { WorkFolderIndex } from "./work-outcome-index";

const GLYPH_FOLDER: WorkFolder = {
  slug: "fixture-folder",
  title: "Fixture Folder",
  cases: [
    {
      slug: "no-media",
      title: "No Media Case",
      badge: "Production",
      surface: "internal-dossier",
      role: "Fixture · no media",
      outcomes: [{ label: "Blurb", text: "First outcome blurb for the glyph row." }],
      stack: ["TypeScript"],
    },
    {
      slug: "missing-asset",
      title: "Missing Asset Case",
      badge: "Prototype",
      surface: "public-storefront",
      role: "Fixture · missing asset",
      outcomes: [{ label: "Fallback", text: "Blurb when inventory src cannot resolve." }],
      stack: ["TypeScript"],
      media: [{ label: "Missing shot", src: "work/does-not-exist/missing.png" }],
    },
  ],
};

function renderFolderIndex(folder: WorkFolder) {
  const result = render(() => (
    <MemoryRouter>
      <Route path="/" component={() => <WorkFolderIndex folder={folder} />} />
    </MemoryRouter>
  ));
  return { ...result, screen: page.elementLocator(result.baseElement) };
}

describe("Work index row thumbnails (App Shell seam)", () => {
  afterEach(() => cleanup());

  it("keeps a soft glyph plate when index media is missing or unresolved", async () => {
    const { screen } = renderFolderIndex(GLYPH_FOLDER);

    for (const name of [/No Media Case.*Production/i, /Missing Asset Case.*Prototype/i]) {
      const row = screen.getByRole("link", { name });
      await expect.element(row).toBeVisible();
      expect(row.element().querySelector("img")).toBeNull();
      const glyph = row.element().querySelector('[data-index-thumb="glyph"]');
      expect(glyph).toBeTruthy();
      expect(glyph?.querySelector("svg")).toBeTruthy();
    }

    await expect
      .element(screen.getByText(/First outcome blurb for the glyph row\./i))
      .toBeVisible();
  });
});
