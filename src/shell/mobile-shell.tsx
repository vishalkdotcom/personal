import { useLocation } from "@solidjs/router";
import { Show, createEffect, createSignal, type ParentComponent } from "solid-js";
import { getWorkCaseFromPath } from "../work/inventory";
import { ContextRail } from "./context-rail";
import { HireSignalChip } from "./hire-signal-chip";
import { LeftChrome } from "./left-chrome";
import { modeTitleForPath } from "./modes";
import { SCROLL_PANE_CLASS } from "./scroll-pane";
import { StageShell } from "./stage-shell";

const iconButtonClass =
  "grid size-[34px] shrink-0 place-items-center rounded-lg border border-border text-muted hover:bg-bg-hover hover:text-fg";

/**
 * Mobile App Shell: single-column stage, ☰ IA drawer, ··· context sheet.
 * Header: Mode title only (Live opens externally from the Context Rail).
 */
export const MobileShell: ParentComponent = (props) => {
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = createSignal(false);
  const [sheetOpen, setSheetOpen] = createSignal(false);

  /** Work Case context is dense — full-screen sheet. Mode rails stay bottom sheets. */
  const sheetDense = () => getWorkCaseFromPath(location.pathname) !== undefined;

  const closeOverlays = () => {
    setDrawerOpen(false);
    setSheetOpen(false);
  };

  createEffect(
    () => location.pathname,
    () => {
      closeOverlays();
    },
  );

  return (
    <div class="relative flex h-full flex-col overflow-hidden bg-bg" data-shell="mobile">
      <header class="flex shrink-0 items-center gap-2 border-b border-border bg-bg-deep px-3 py-2.5">
        <button
          type="button"
          class={iconButtonClass}
          aria-label="Open navigation"
          aria-expanded={drawerOpen() ? "true" : "false"}
          onClick={() => {
            closeOverlays();
            setDrawerOpen(true);
          }}
        >
          ☰
        </button>
        <h1 class="m-0 min-w-0 flex-1 truncate text-xs font-semibold">
          {modeTitleForPath(location.pathname)}
        </h1>
        <button
          type="button"
          class={iconButtonClass}
          aria-label="Open context"
          aria-expanded={sheetOpen() ? "true" : "false"}
          title="Details"
          onClick={() => {
            closeOverlays();
            setSheetOpen(true);
          }}
        >
          ···
        </button>
      </header>

      <StageShell density="mobile" class="min-h-0 min-w-0 flex-1 overflow-auto bg-bg-panel">
        {props.children}
      </StageShell>

      <HireSignalChip />

      <Show when={drawerOpen() || sheetOpen()}>
        <button
          type="button"
          class="absolute inset-0 z-30 border-0 bg-black/50 p-0"
          aria-label="Dismiss overlay"
          onClick={closeOverlays}
        />
      </Show>

      <Show when={drawerOpen()}>
        <aside
          class={`${SCROLL_PANE_CLASS} absolute top-0 bottom-0 left-0 z-40 flex w-[min(82%,300px)] flex-col overflow-auto border-r border-border bg-bg-deep p-[12px_8px]`}
          role="dialog"
          aria-modal="true"
          aria-label="Navigation"
          onClick={(event) => {
            // Close even when the Mode href matches the current path (About → `/`).
            if ((event.target as Element | null)?.closest?.("a[href]")) closeOverlays();
          }}
        >
          <LeftChrome />
        </aside>
      </Show>

      <Show when={sheetOpen()}>
        <aside
          class={
            sheetDense()
              ? `${SCROLL_PANE_CLASS} absolute inset-0 z-40 overflow-auto border-t border-border bg-bg-deep p-[12px_10px]`
              : `${SCROLL_PANE_CLASS} absolute right-0 bottom-0 left-0 z-40 max-h-[62%] overflow-auto rounded-t-2xl border-t border-border bg-bg-deep p-[12px_10px_20px]`
          }
          role="dialog"
          aria-modal="true"
          aria-label="Context"
          data-dense={sheetDense() ? "" : undefined}
        >
          <Show when={!sheetDense()}>
            <div class="mx-auto mb-3 h-1 w-9 rounded-full bg-border" aria-hidden="true" />
          </Show>
          <ContextRail />
        </aside>
      </Show>
    </div>
  );
};
