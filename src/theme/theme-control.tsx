import { createSignal, onSettled, type Component } from "solid-js";
import {
  cycleThemePreference,
  readThemePreference,
  syncThemeFromPreference,
  writeThemePreference,
  type ThemePreference,
} from "./theme";

function preferenceLabel(preference: ThemePreference): string {
  if (preference === "system") return "System";
  if (preference === "light") return "Light";
  return "Dark";
}

/** Brand-row control: cycles system → light → dark and persists the preference. */
export const ThemeControl: Component = () => {
  const [preference, setPreference] = createSignal<ThemePreference>(
    readThemePreference(),
  );

  onSettled(() => {
    syncThemeFromPreference(preference());

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onSchemeChange = () => {
      if (preference() === "system") {
        syncThemeFromPreference("system");
      }
    };
    media.addEventListener("change", onSchemeChange);
    return () => media.removeEventListener("change", onSchemeChange);
  });

  const onCycle = () => {
    // Solid 2 queues writes until flush — use the updater so rapid clicks
    // (and tests) chain off the pending preference, not a stale read.
    setPreference((current) => {
      const next = cycleThemePreference(current);
      writeThemePreference(next);
      syncThemeFromPreference(next);
      return next;
    });
  };

  return (
    <button
      type="button"
      class="theme-control"
      onClick={onCycle}
      aria-label={`Theme: ${preferenceLabel(preference())}. Click to cycle System, Light, Dark.`}
      title={`Theme: ${preferenceLabel(preference())}`}
    >
      <span class="theme-control__icon" aria-hidden="true">
        {preference() === "light" ? (
          <svg viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </svg>
        ) : preference() === "dark" ? (
          <svg viewBox="0 0 24 24">
            <path d="M21 14.5A8.5 8.5 0 0 1 9.5 3 7 7 0 1 0 21 14.5z" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 3v18" />
            <path
              d="M12 3a9 9 0 0 1 0 18"
              fill="currentColor"
              stroke="none"
              opacity="0.35"
            />
          </svg>
        )}
      </span>
    </button>
  );
};
