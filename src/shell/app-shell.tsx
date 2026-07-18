import type { ParentComponent } from "solid-js";
import { ThemeControl } from "../theme/theme-control";

/**
 * Minimal App Shell chrome for the scaffold ticket:
 * brand row (with FOUC-safe theme control) + center stage outlet.
 * Full Triptych Dock ships in a later ticket.
 */
export const AppShell: ParentComponent = (props) => (
  <div class="app-shell">
    <aside class="app-shell__brand-rail" aria-label="Brand">
      <div class="brand-row">
        <div class="brand-row__identity">
          <div class="brand-row__name">Vishal Kumar</div>
          <div class="brand-row__sub">Senior FE · Reporting UIs</div>
        </div>
        <ThemeControl />
      </div>
    </aside>
    <main class="app-shell__stage" id="stage">
      {props.children}
    </main>
  </div>
);
