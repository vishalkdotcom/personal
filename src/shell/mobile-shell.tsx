import { useLocation } from "@solidjs/router";
import { Show, createEffect, createSignal, type ParentComponent } from "solid-js";
import { getActiveWorkCaseFromPath, isPreviewEnabledForPath } from "../work/inventory";
import { ContextRail } from "./context-rail";
import { shellCrumbForPath } from "./header-crumb";
import { LeftChrome } from "./left-chrome";
import { PreviewSlideOver } from "./preview-slide-over";

const iconButtonClass =
  "grid size-[34px] shrink-0 place-items-center rounded-lg border border-border text-muted hover:bg-bg-hover hover:text-fg disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-muted";

const iconButtonAccentClass =
  "grid size-[34px] shrink-0 place-items-center rounded-lg border border-transparent bg-accent/14 text-accent hover:bg-accent/22 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-accent/14";

/**
 * Mobile App Shell: single-column stage, ☰ IA drawer, ··· context sheet, full-screen Preview.
 */
export const MobileShell: ParentComponent = (props) => {
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = createSignal(false);
  const [sheetOpen, setSheetOpen] = createSignal(false);
  const [previewOpen, setPreviewOpen] = createSignal(false);

  const previewEnabled = () => isPreviewEnabledForPath(location.pathname);
  const activeCase = () => getActiveWorkCaseFromPath(location.pathname);
  const crumb = () => shellCrumbForPath(location.pathname);
  /** Work Case context is dense — full-screen sheet. Mode rails stay bottom sheets. */
  const sheetDense = () => getActiveWorkCaseFromPath(location.pathname) !== undefined;

  const closeOverlays = () => {
    setDrawerOpen(false);
    setSheetOpen(false);
    setPreviewOpen(false);
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
        <nav class="min-w-0 flex-1" aria-label="Breadcrumb">
          <div class="truncate text-xs font-semibold">{crumb().trail}</div>
          <Show when={crumb().modeLabel !== crumb().trail}>
            <div class="mt-0.5 text-[10px] text-faint">{crumb().modeLabel}</div>
          </Show>
        </nav>
        <button
          type="button"
          class={previewEnabled() ? iconButtonAccentClass : iconButtonClass}
          aria-label="Preview"
          aria-pressed={previewOpen() ? "true" : "false"}
          disabled={!previewEnabled()}
          title={previewEnabled() ? "Preview" : "No public preview"}
          onClick={() => {
            if (!previewEnabled()) return;
            closeOverlays();
            setPreviewOpen(true);
          }}
        >
          ▣
        </button>
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

      <main class="min-h-0 min-w-0 flex-1 overflow-auto bg-bg-panel px-4 py-5" id="stage">
        {props.children}
      </main>

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
          class="absolute top-0 bottom-0 left-0 z-40 flex w-[min(82%,300px)] flex-col overflow-auto border-r border-border bg-bg-deep p-[12px_8px]"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation"
        >
          <LeftChrome />
        </aside>
      </Show>

      <Show when={sheetOpen()}>
        <aside
          class={
            sheetDense()
              ? "absolute inset-0 z-40 overflow-auto border-t border-border bg-bg-deep p-[12px_10px]"
              : "absolute right-0 bottom-0 left-0 z-40 max-h-[62%] overflow-auto rounded-t-2xl border-t border-border bg-bg-deep p-[12px_10px_20px]"
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

      <Show when={previewOpen() && previewEnabled() ? activeCase() : undefined}>
        {(workCase) => (
          <PreviewSlideOver
            live={workCase().live}
            layout="fullscreen"
            onClose={() => setPreviewOpen(false)}
          />
        )}
      </Show>
    </div>
  );
};
