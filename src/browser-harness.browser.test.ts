import { afterEach, describe, expect, it } from "vitest";
import { applyResolvedTheme } from "./theme/theme";

/**
 * Harness seam: Vitest Browser Mode must load global CSS via vitest.browser.setup.ts
 * so themed token-backed styles resolve without per-suite stylesheet imports.
 */
describe("browser harness styles (test harness seam)", () => {
  afterEach(() => {
    document.documentElement.removeAttribute("data-theme");
    document.body.replaceChildren();
  });

  it("resolves themed computed styles from the shared global stylesheet", () => {
    applyResolvedTheme("light");

    const el = document.createElement("div");
    el.style.backgroundColor = "var(--vk-bg)";
    el.style.color = "var(--vk-fg)";
    document.body.append(el);

    const styles = getComputedStyle(el);
    expect(styles.backgroundColor).toBe("rgb(244, 245, 246)");
    expect(styles.color).toBe("rgb(26, 28, 30)");
  });
});
