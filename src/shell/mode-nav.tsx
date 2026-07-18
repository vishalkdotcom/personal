import { A, useLocation, useNavigate } from "@solidjs/router";
import { For, type Component } from "solid-js";
import { MODES, type ModeId } from "./modes";

const ModeIcon: Component<{ id: ModeId }> = (props) => {
  switch (props.id) {
    case "work":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
        </svg>
      );
    case "about":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 20c1.5-3.5 4-5 8-5s6.5 1.5 8 5" />
        </svg>
      );
    case "resume":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 4h16v16H4z" />
          <path d="M8 8h8M8 12h8M8 16h5" />
        </svg>
      );
    case "contact":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 6h16v12H4z" />
          <path d="M4 8l8 5 8-5" />
        </svg>
      );
  }
};

function isModifiedClick(event: MouseEvent): boolean {
  return (
    event.button !== 0 ||
    event.metaKey ||
    event.altKey ||
    event.ctrlKey ||
    event.shiftKey
  );
}

/** Left chrome Mode list: icon + label, no bullet dots, no Notes. */
export const ModeNav: Component = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav class="mode-nav" aria-label="Modes">
      <For each={MODES}>
        {(mode) => {
          const active = () => mode.matches(location.pathname);
          return (
            <A
              href={mode.href}
              class={
                active()
                  ? "mode-nav__item mode-nav__item--active"
                  : "mode-nav__item"
              }
              activeClass=""
              inactiveClass=""
              aria-label={mode.label}
              title={mode.label}
              end={mode.href === "/"}
              onClick={(event) => {
                if (event.defaultPrevented || isModifiedClick(event)) return;
                event.preventDefault();
                navigate(mode.href);
              }}
            >
              <span class="mode-nav__ico" aria-hidden="true">
                <ModeIcon id={mode.id} />
              </span>
              <span class="mode-nav__label">{mode.label}</span>
            </A>
          );
        }}
      </For>
    </nav>
  );
};
