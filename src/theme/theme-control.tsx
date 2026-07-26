import { For, Show, createEffect, createSignal, onSettled, type Component } from "solid-js";
import {
  readThemePreference,
  syncThemeFromPreference,
  writeThemePreference,
  type ThemePreference,
} from "./theme";

const PREFERENCE_OPTIONS = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
] as const satisfies ReadonlyArray<{ value: ThemePreference; label: string }>;

function preferenceLabel(preference: ThemePreference): string {
  return PREFERENCE_OPTIONS.find((option) => option.value === preference)?.label ?? "System";
}

const iconSvgClass =
  "block size-[15px] fill-none stroke-current [stroke-linecap:round] [stroke-linejoin:round] [stroke-width:1.6]";

/** Brand-row control: System / Light / Dark menu; persists preference (FOUC-safe). */
export const ThemeControl: Component = () => {
  const [preference, setPreference] = createSignal<ThemePreference>(readThemePreference());
  const [menuOpen, setMenuOpen] = createSignal(false);
  let triggerEl: HTMLButtonElement | undefined;

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

  createEffect(
    () => menuOpen(),
    (isOpen) => {
      if (!isOpen) return;

      const onPointerDown = (event: PointerEvent) => {
        const target = event.target;
        if (target instanceof Element && target.closest("[data-theme-control]")) return;
        setMenuOpen(false);
      };
      const onKeyDown = (event: KeyboardEvent) => {
        if (event.key !== "Escape") return;
        setMenuOpen(false);
        triggerEl?.focus();
      };
      document.addEventListener("pointerdown", onPointerDown);
      document.addEventListener("keydown", onKeyDown);
      return () => {
        document.removeEventListener("pointerdown", onPointerDown);
        document.removeEventListener("keydown", onKeyDown);
      };
    },
  );

  const choose = (next: ThemePreference) => {
    try {
      writeThemePreference(next);
    } catch {
      // private mode / blocked storage — still apply resolved theme for this session
    }
    syncThemeFromPreference(next);
    setPreference(next);
    setMenuOpen(false);
  };

  return (
    <div data-theme-control class="relative shrink-0 group-data-[left-collapsed]/shell:hidden">
      <button
        ref={(el) => {
          triggerEl = el;
        }}
        type="button"
        class="grid size-7 place-items-center rounded-md border border-transparent text-muted hover:bg-bg-hover hover:text-fg aria-expanded:border-border aria-expanded:bg-bg-active aria-expanded:text-fg"
        aria-label={`Theme: ${preferenceLabel(preference())}`}
        aria-haspopup="true"
        aria-expanded={menuOpen() ? "true" : "false"}
        aria-controls="theme-preference-menu"
        title={`Theme: ${preferenceLabel(preference())}`}
        onClick={() => setMenuOpen((open) => !open)}
      >
        <span class="block size-[15px]" aria-hidden="true">
          {preference() === "light" ? (
            <svg class={iconSvgClass} viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
            </svg>
          ) : preference() === "dark" ? (
            <svg class={iconSvgClass} viewBox="0 0 24 24">
              <path d="M21 14.5A8.5 8.5 0 0 1 9.5 3 7 7 0 1 0 21 14.5z" />
            </svg>
          ) : (
            <svg class={iconSvgClass} viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 3v18" />
              <path d="M12 3a9 9 0 0 1 0 18" fill="currentColor" stroke="none" opacity="0.35" />
            </svg>
          )}
        </span>
      </button>
      <Show when={menuOpen()}>
        <div
          id="theme-preference-menu"
          class="absolute top-9 right-0 z-20 w-[148px] rounded-lg border border-border bg-bg-panel p-1 shadow-[0_10px_28px_rgba(0,0,0,0.35)]"
          role="radiogroup"
          aria-label="Theme"
        >
          <For each={PREFERENCE_OPTIONS}>
            {(option) => {
              const selected = () => preference() === option.value;
              return (
                <button
                  type="button"
                  role="radio"
                  aria-checked={selected() ? "true" : "false"}
                  class="flex w-full items-center justify-between rounded-md px-2.5 py-[7px] text-xs text-muted hover:bg-bg-hover hover:text-fg aria-checked:bg-accent/14 aria-checked:font-semibold aria-checked:text-accent"
                  onClick={() => choose(option.value)}
                >
                  <span>{option.label}</span>
                  <span
                    class={selected() ? "text-[11px]" : "text-[11px] opacity-0"}
                    aria-hidden="true"
                  >
                    ✓
                  </span>
                </button>
              );
            }}
          </For>
        </div>
      </Show>
    </div>
  );
};
