import { beforeEach, describe, expect, it } from "vitest";
import {
  THEME_STORAGE_KEY,
  applyResolvedTheme,
  cycleThemePreference,
  readThemePreference,
  resolveTheme,
  writeThemePreference,
  type ThemePreference,
} from "./theme";

describe("theme preference (App Shell seam)", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
  });

  it("defaults to system when nothing is persisted", () => {
    expect(readThemePreference()).toBe("system");
  });

  it("persists and reads system | light | dark", () => {
    const prefs: ThemePreference[] = ["system", "light", "dark"];
    for (const pref of prefs) {
      writeThemePreference(pref);
      expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe(pref);
      expect(readThemePreference()).toBe(pref);
    }
  });

  it("ignores unknown stored values and falls back to system", () => {
    localStorage.setItem(THEME_STORAGE_KEY, "purple");
    expect(readThemePreference()).toBe("system");
  });

  it("resolves system from OS preference", () => {
    expect(resolveTheme("system", true)).toBe("dark");
    expect(resolveTheme("system", false)).toBe("light");
    expect(resolveTheme("light", true)).toBe("light");
    expect(resolveTheme("dark", false)).toBe("dark");
  });

  it("applies resolved theme on documentElement before paint consumers read it", () => {
    applyResolvedTheme("light");
    expect(document.documentElement.dataset.theme).toBe("light");
    applyResolvedTheme("dark");
    expect(document.documentElement.dataset.theme).toBe("dark");
  });

  it("cycles brand-row control system → light → dark → system", () => {
    expect(cycleThemePreference("system")).toBe("light");
    expect(cycleThemePreference("light")).toBe("dark");
    expect(cycleThemePreference("dark")).toBe("system");
  });
});
