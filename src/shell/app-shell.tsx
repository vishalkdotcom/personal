import { useLocation } from "@solidjs/router";
import { createSignal, type ParentComponent } from "solid-js";
import { ThemeControl } from "../theme/theme-control";
import { ModeNav } from "./mode-nav";
import { modeTitleForPath } from "./modes";

/**
 * Desktop Triptych Dock: left IA · center stage · Context Rail.
 * Left chrome Modes; header chips collapse left / Context Rail.
 * Work tree and Context Rail body ship in later tickets.
 */
export const AppShell: ParentComponent = (props) => {
  const location = useLocation();
  const [leftCollapsed, setLeftCollapsed] = createSignal(false);
  const [rightCollapsed, setRightCollapsed] = createSignal(false);

  return (
    <div
      class="app-shell"
      data-left-collapsed={leftCollapsed() ? "" : undefined}
      data-right-collapsed={rightCollapsed() ? "" : undefined}
    >
      <aside class="app-shell__left" aria-label="Left chrome">
        <div class="brand-row">
          <div class="brand-row__identity">
            <div class="brand-row__name">Vishal Kumar</div>
            <div class="brand-row__sub">Senior FE · Reporting UIs</div>
          </div>
          <ThemeControl />
        </div>
        <ModeNav />
      </aside>

      <div class="app-shell__center">
        <header class="app-shell__head">
          <h1 class="app-shell__head-title">{modeTitleForPath(location.pathname)}</h1>
          <div class="app-shell__head-actions">
            <button
              type="button"
              class="shell-chip"
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
              class="shell-chip"
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
        <main class="app-shell__stage" id="stage">
          {props.children}
        </main>
      </div>

      <aside
        class="app-shell__context"
        aria-label="Context Rail"
        aria-hidden={rightCollapsed() ? "true" : "false"}
      >
        <p class="app-shell__context-stub">
          Context Rail — case and Mode context ships in a later ticket.
        </p>
      </aside>
    </div>
  );
};
