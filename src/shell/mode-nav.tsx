import { A, useLocation, useNavigate } from "@solidjs/router";
import { For, type Component } from "solid-js";
import { MODES, type ModeId } from "./modes";

const iconSvgClass =
  "size-[15px] fill-none stroke-current [stroke-linecap:round] [stroke-linejoin:round] [stroke-width:1.6]";

const ModeIcon: Component<{ id: ModeId }> = (props) => {
  switch (props.id) {
    case "work":
      return (
        <svg class={iconSvgClass} viewBox="0 0 24 24" aria-hidden="true">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
        </svg>
      );
    case "about":
      return (
        <svg class={iconSvgClass} viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 20c1.5-3.5 4-5 8-5s6.5 1.5 8 5" />
        </svg>
      );
    case "resume":
      return (
        <svg class={iconSvgClass} viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 4h16v16H4z" />
          <path d="M8 8h8M8 12h8M8 16h5" />
        </svg>
      );
    case "contact":
      return (
        <svg class={iconSvgClass} viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 6h16v12H4z" />
          <path d="M4 8l8 5 8-5" />
        </svg>
      );
  }
};

function isModifiedClick(event: MouseEvent): boolean {
  return event.button !== 0 || event.metaKey || event.altKey || event.ctrlKey || event.shiftKey;
}

function modeItemClass(active: boolean): string {
  return [
    "flex items-center gap-2.5 whitespace-nowrap rounded-md px-2.5 py-[7px] text-[13px] font-medium",
    "group-data-[left-collapsed]/shell:justify-center group-data-[left-collapsed]/shell:p-2",
    active ? "bg-bg-active text-fg" : "text-muted hover:bg-bg-hover hover:text-fg",
  ].join(" ");
}

/** Left chrome Mode list: icon + label, no bullet dots, no Notes. */
export const ModeNav: Component = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav class="mb-4 flex flex-col gap-px" aria-label="Modes">
      <For each={MODES}>
        {(mode) => {
          const active = () => mode.matches(location.pathname);
          return (
            <A
              href={mode.href}
              class={modeItemClass(active())}
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
              <span class="grid size-4 shrink-0 place-items-center opacity-75" aria-hidden="true">
                <ModeIcon id={mode.id} />
              </span>
              <span class="group-data-[left-collapsed]/shell:hidden">{mode.label}</span>
            </A>
          );
        }}
      </For>
    </nav>
  );
};
