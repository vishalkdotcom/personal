import { useLocation } from "@solidjs/router";
import { createSignal, type ParentComponent } from "solid-js";
import { ThemeControl } from "../theme/theme-control";
import { ModeNav } from "./mode-nav";
import { modeTitleForPath } from "./modes";

const shellChipClass =
  "rounded-md border border-border bg-bg-deep px-2.5 py-[5px] text-xs leading-none text-muted hover:bg-bg-hover hover:text-fg aria-pressed:bg-bg-active aria-pressed:text-fg";

/**
 * Desktop Triptych Dock: left IA · center stage · Context Rail.
 * Left chrome Modes; header chips collapse left / Context Rail.
 * Work tree and Context Rail body ship in later tickets.
 */
export const AppShell: ParentComponent = (props) => {
  const location = useLocation();
  const [leftCollapsed, setLeftCollapsed] = createSignal(false);
  const [rightCollapsed, setRightCollapsed] = createSignal(false);

  const gridColumns = () =>
    [
      leftCollapsed() ? "48px" : "252px",
      "minmax(0, 1fr)",
      rightCollapsed() ? "0fr" : "288px",
    ].join(" ");

  return (
    <div
      class="group/shell grid h-full bg-bg transition-[grid-template-columns] duration-[180ms] ease-shell"
      style={{ "grid-template-columns": gridColumns() }}
      data-left-collapsed={leftCollapsed() ? "" : undefined}
      data-right-collapsed={rightCollapsed() ? "" : undefined}
    >
      <aside
        class="flex min-w-0 flex-col overflow-hidden border-r border-border bg-bg-deep p-[12px_8px] transition-[padding] duration-[160ms] ease-shell group-data-[left-collapsed]/shell:p-[10px_6px]"
        aria-label="Left chrome"
      >
        <div class="flex items-start justify-between gap-2 p-[4px_8px_14px] group-data-[left-collapsed]/shell:justify-center group-data-[left-collapsed]/shell:p-[4px_0_10px]">
          <div class="group-data-[left-collapsed]/shell:hidden">
            <div class="whitespace-nowrap text-sm font-[650] tracking-[-0.02em]">
              Vishal Kumar
            </div>
            <div class="mt-[3px] whitespace-nowrap text-[11px] text-faint">
              Senior FE · Reporting UIs
            </div>
          </div>
          <ThemeControl />
        </div>
        <ModeNav />
      </aside>

      <div class="flex min-w-0 flex-col overflow-hidden bg-bg">
        <header class="flex shrink-0 items-center justify-between gap-3 border-b border-border px-4 py-2.5">
          <h1 class="m-0 text-[13.5px] font-semibold">
            {modeTitleForPath(location.pathname)}
          </h1>
          <div class="flex items-center gap-1.5">
            <button
              type="button"
              class={shellChipClass}
              aria-pressed={leftCollapsed() ? "true" : "false"}
              aria-label={
                leftCollapsed() ? "Expand left chrome" : "Collapse left chrome"
              }
              title={leftCollapsed() ? "Expand left" : "Collapse left"}
              onClick={() => setLeftCollapsed((value) => !value)}
            >
              ⌞
            </button>
            <button
              type="button"
              class={shellChipClass}
              aria-pressed={rightCollapsed() ? "true" : "false"}
              aria-label={
                rightCollapsed()
                  ? "Expand Context Rail"
                  : "Collapse Context Rail"
              }
              title={
                rightCollapsed() ? "Expand Context Rail" : "Collapse Context Rail"
              }
              onClick={() => setRightCollapsed((value) => !value)}
            >
              ⌟
            </button>
          </div>
        </header>
        <main
          class="min-w-0 flex-1 overflow-auto bg-bg-panel px-9 py-7"
          id="stage"
        >
          {props.children}
        </main>
      </div>

      <aside
        class="min-w-0 overflow-auto border-l border-border bg-bg-deep p-[12px_10px] transition-[opacity,padding] duration-[160ms] ease-shell group-data-[right-collapsed]/shell:pointer-events-none group-data-[right-collapsed]/shell:overflow-hidden group-data-[right-collapsed]/shell:border-none group-data-[right-collapsed]/shell:p-0 group-data-[right-collapsed]/shell:opacity-0"
        aria-label="Context Rail"
        aria-hidden={rightCollapsed() ? "true" : "false"}
      >
        <p class="m-0 p-2 text-xs leading-[1.45] text-faint">
          Context Rail — case and Mode context ships in a later ticket.
        </p>
      </aside>
    </div>
  );
};
