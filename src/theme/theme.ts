export type ThemePreference = "system" | "light" | "dark";
export type ResolvedTheme = "light" | "dark";

export const THEME_STORAGE_KEY = "vk-theme";

const PREFERENCES = new Set<ThemePreference>(["system", "light", "dark"]);

export function readThemePreference(): ThemePreference {
  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY);
    if (raw && PREFERENCES.has(raw as ThemePreference)) {
      return raw as ThemePreference;
    }
  } catch {
    // localStorage unavailable (private mode / SSR) — default System
  }
  return "system";
}

export function writeThemePreference(preference: ThemePreference): void {
  localStorage.setItem(THEME_STORAGE_KEY, preference);
}

export function resolveTheme(preference: ThemePreference, systemDark: boolean): ResolvedTheme {
  if (preference === "light") return "light";
  if (preference === "dark") return "dark";
  return systemDark ? "dark" : "light";
}

export function applyResolvedTheme(resolved: ResolvedTheme): void {
  document.documentElement.dataset.theme = resolved;
}

export function systemPrefersDark(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

/** Sync preference → resolved `data-theme` for the App Shell. */
export function syncThemeFromPreference(preference: ThemePreference): void {
  applyResolvedTheme(resolveTheme(preference, systemPrefersDark()));
}
