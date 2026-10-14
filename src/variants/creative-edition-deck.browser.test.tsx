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

describe("5 Interactive Creative Worlds (01 Synth · 02 Cosmos · 03 Arcade · 04 VK-OS · 05 Poster)", () => {
  afterEach(() => {
    cleanup();
    const { setVariant } = useSiteVariant();
    setVariant("synth");
  });

  it("renders the interactive Creative Worlds deck on / and switches cleanly across all 5 worlds", async () => {
    const { screen } = renderAt("/");
    const deck = screen
      .getByRole("main")
      .getByRole("region", { name: /Interactive Creative Worlds/i });

    await expect.element(deck).toBeVisible();

    // World 01: Modular Synth & CRT Oscilloscope Rack
    await expect.element(deck.getByText(/MOD-02 \/\/ LIVE SCORE PARITY CRT/i)).toBeVisible();
    await expect.element(deck.getByText(/CH1 QUESTION-FIRST \[AUTH\]: 54\.90/i)).toBeVisible();

    // Toggle Skew Pair preset (420 vs 38 respondents)
    await deck.getByRole("button", { name: /Skew Pair/i }).click();
    await expect.element(deck.getByText(/Active Sites: 2\/8/i)).toBeVisible();

    // Switch to World 02: Constellation Observatory
    await deck.getByRole("button", { name: /02.*Cosmos/i }).click();
    await expect
      .element(deck.getByText(/OBSERVATORY \/\/ DRAG OR CLICK ANY STAR NODE/i))
      .toBeVisible();

    // Switch to World 03: 1986 Arcade Boss-Rush Cabinet
    await deck.getByRole("button", { name: /03.*Arcade/i }).click();
    await expect
      .element(deck.getByRole("heading", { name: /THE SCORE DRIFT HYDRA/i }))
      .toBeVisible();
    await deck.getByRole("button", { name: /DEF-02/i }).click();
    await expect
      .element(deck.getByText(/questionTypeMapper\.ts · cases 1 & 3 swapped/i))
      .toBeVisible();

    // Switch to World 04: VK-OS Spatial Workstation
    await deck.getByRole("button", { name: /04.*VK-OS/i }).click();
    await expect.element(deck.getByText(/VK-OS 2026\.10/i)).toBeVisible();
    await deck.getByRole("button", { name: /hyperfine-build/i }).click();
    await expect.element(deck.getByText(/After Next 16 \+ De-Barrel: 40\.6s/i)).toBeVisible();

    // Switch to World 05: Swiss Kinetic Brutalist Exhibition
    await deck.getByRole("button", { name: /05.*Poster/i }).click();
    await expect.element(deck.getByText(/54\.90 ≠ 54\.31/i)).toBeVisible();
  });

  it("launches Full-Viewport Standalone Worlds from the bottom dock and returns to the Triptych Shell", async () => {
    const { screen } = renderAt("/");
    const dock = screen.getByRole("region", { name: /Full-Viewport World Switcher/i });
    await expect.element(dock).toBeVisible();

    await dock.getByRole("button", { name: /03·Arcade/i }).click();
    const overlay = document.querySelector("[data-full-canvas-active='arcade']");
    expect(overlay).toBeTruthy();

    await screen.getByRole("button", { name: /Return to Triptych Shell/i }).click();
    expect(document.querySelector("[data-full-canvas-active]")).toBeNull();
  });

  it("never references awesomeapps.org or awesomeapps in any variant store or extra data", () => {
    expect(SITE_VARIANTS).toHaveLength(5);
    const serialized = JSON.stringify({
      SITE_VARIANTS,
      ARCHITECTURE_PROOFS,
      ALL_ENRICHED_WORK,
      OPEN_SOURCE_EXTRAS,
    });
    expect(serialized).not.toMatch(/awesomeapps/i);
  });
});
