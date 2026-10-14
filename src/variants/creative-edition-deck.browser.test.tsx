import { cleanup, render } from "@solidjs/testing-library";
import { createMemoryHistory, MemoryRouter } from "@solidjs/router";
import { afterEach, describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import { AppShellRoutes } from "../app";
import {
  ALL_ENRICHED_WORK,
  ARCHITECTURE_PROOFS,
  OPEN_SOURCE_EXTRAS,
  SITE_VARIANTS,
  useSiteVariant,
} from "./variant-store";

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

describe("Creative Editions (01 Ledger · 02 Monograph · 03 Deck · 04 Signal)", () => {
  afterEach(() => {
    cleanup();
    const { setVariant } = useSiteVariant();
    setVariant("ledger");
  });

  it("renders the interactive Creative Edition Deck on / and switches cleanly across all 4 variants", async () => {
    const { screen } = renderAt("/");
    const studio = screen
      .getByRole("main")
      .getByRole("region", { name: /Engineering proof studio/i });

    await expect.element(studio).toBeVisible();
    await expect.element(studio).toHaveAttribute("data-creative-edition", "ledger");

    // Variant 01: Proof Ledger & Counterexample Simulator
    await expect
      .element(
        studio.getByText(
          /Why Dashboard \(Question-First\) & Excel \(Facility-First\) Scores Diverged/i,
        ),
      )
      .toBeVisible();
    await expect.element(studio.getByText(/84\.5s ± 11\.4s/i)).toBeVisible();
    await expect.element(studio.getByText(/40\.6s ± 3\.2s/i)).toBeVisible();

    // Toggle a facility preset in the counterexample harness
    await studio.getByRole("button", { name: /^2-Site Extreme$/i }).click();
    await expect
      .element(studio.getByText(/Unweighted mean across 2 facility averages/i))
      .toBeVisible();

    // Switch to Variant 02: Monograph
    await studio.getByRole("button", { name: /02.*Monograph/i }).click();
    await expect.element(studio).toHaveAttribute("data-creative-edition", "monograph");
    await expect
      .element(studio.getByText(/One Scoring Authority, Not Two Formulas/i))
      .toBeVisible();
    await expect.element(studio.getByText(/The Value of the Confident 'No'/i)).toBeVisible();

    // Switch to Variant 03: Command Deck
    await studio.getByRole("button", { name: /03.*Deck/i }).click();
    await expect.element(studio).toHaveAttribute("data-creative-edition", "command");
    await expect.element(studio.getByText(/Review Gatekeeper · PR #155/i)).toBeVisible();
    await studio.getByRole("button", { name: /DEF-02/i }).click();
    await expect
      .element(studio.getByText(/questionTypeMapper\.ts · numeric fallback swap/i))
      .toBeVisible();

    // Switch to Variant 04: Signal Index
    await studio.getByRole("button", { name: /04.*Signal/i }).click();
    await expect.element(studio).toHaveAttribute("data-creative-edition", "signal");
    await expect.element(studio.getByText(/10-Second Executive Scan/i)).toBeVisible();
  });

  it("launches the Full-Canvas Standalone Editions from the bottom switcher and returns to the Triptych Shell", async () => {
    const { screen } = renderAt("/");
    const launcher = screen.getByRole("group", { name: /Full-bleed creative editions/i });
    await expect.element(launcher).toBeVisible();

    await launcher.getByRole("button", { name: /02·Monograph/i }).click();
    const overlay = document.querySelector("[data-full-canvas-variant='monograph']");
    expect(overlay).toBeTruthy();

    await screen.getByRole("button", { name: /Triptych Shell/i }).click();
    expect(document.querySelector("[data-full-canvas-variant]")).toBeNull();
  });

  it("never references awesomeapps.org or awesomeapps in any variant store or extra data", () => {
    expect(SITE_VARIANTS).toHaveLength(4);
    const serialized = JSON.stringify({
      SITE_VARIANTS,
      ARCHITECTURE_PROOFS,
      ALL_ENRICHED_WORK,
      OPEN_SOURCE_EXTRAS,
    });
    expect(serialized).not.toMatch(/awesomeapps/i);
  });
});
