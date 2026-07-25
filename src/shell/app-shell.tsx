import { useLocation } from "@solidjs/router";
import { Show, createEffect, createSignal, type ParentComponent } from "solid-js";
import { getWorkCaseFromPath, isPreviewEnabledForPath } from "../work/inventory";
import { ContextRail } from "./context-rail";
import { MOBILE_SHELL_QUERY, createMediaQuery } from "./create-media-query";
import { LeftChrome } from "./left-chrome";
import { MobileShell } from "./mobile-shell";
import { modeTitleForPath } from "./modes";
import { PreviewSlideOver } from "./preview-slide-over";

const shellChipClass =
  "rounded-md border border-border bg-bg-deep px-2.5 py-[5px] text-xs leading-none text-muted hover:bg-bg-hover hover:text-fg aria-pressed:bg-bg-active aria-pressed:text-fg disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:bg-bg-deep disabled:hover:text-muted";

/**
 * Desktop Triptych Dock: left IA · center stage · Context Rail.
 * Header hybrid A: Preview (Public Storefront only) + pane collapse chips.
 */
const DesktopTriptych: ParentComponent = (props) => {
  const location = useLocation();
  const [leftCollapsed, setLeftCollapsed] = createSignal(false);
  const [rightCollapsed, setRightCollapsed] = createSignal(false);
  const [previewOpen, setPreviewOpen] = createSignal(false);

  const previewEnabled = () => isPreviewEnabledForPath(location.pathname);
  const activeCase = () => getWorkCaseFromPath(location.pathname);

  createEffect(
    () => location.pathname,
    () => {
      setPreviewOpen(false);
    },
  );

  const gridColumns = () =>
    [leftCollapsed() ? "48px" : "252px", "minmax(0, 1fr)", rightCollapsed() ? "0fr" : "288px"].join(
      " ",
    );

  return (
    <div
      class="group/shell grid h-full bg-bg transition-[grid-template-columns] duration-[180ms] ease-shell"
      style={{ "grid-template-columns": gridColumns() }}
      data-left-collapsed={leftCollapsed() ? "" : undefined}
      data-right-collapsed={rightCollapsed() ? "" : undefined}
      data-preview-open={previewOpen() ? "" : undefined}
      data-shell="desktop"
    >
      <aside
        class="flex min-w-0 flex-col overflow-hidden border-r border-border bg-bg-deep p-[12px_8px] transition-[padding] duration-[160ms] ease-shell group-data-[left-collapsed]/shell:p-[10px_6px]"
        aria-label="Left chrome"
      >
        <LeftChrome />
      </aside>

      <div class="flex min-w-0 flex-col overflow-hidden bg-bg">
        <header class="flex shrink-0 items-center justify-between gap-3 border-b border-border px-4 py-2.5">
          <h1 class="m-0 text-[13.5px] font-semibold">{modeTitleForPath(location.pathname)}</h1>
          <div class="flex items-center gap-1.5">
            <button
              type="button"
              class={shellChipClass}
              aria-pressed={previewOpen() ? "true" : "false"}
              disabled={!previewEnabled()}
              title={previewEnabled() ? "Preview" : "No public preview"}
              onClick={() => {
                if (!previewEnabled()) return;
                setPreviewOpen((value) => !value);
              }}
            >
              Preview
            </button>
            <button
              type="button"
              class={shellChipClass}
              aria-pressed={leftCollapsed() ? "true" : "false"}
              aria-label={leftCollapsed() ? "Expand left chrome" : "Collapse left chrome"}
              title={leftCollapsed() ? "Expand left" : "Collapse left"}
              onClick={() => setLeftCollapsed((value) => !value)}
            >
              ⌞
            </button>
            <button
              type="button"
              class={shellChipClass}
              aria-pressed={rightCollapsed() ? "true" : "false"}
              aria-label={rightCollapsed() ? "Expand Context Rail" : "Collapse Context Rail"}
              title={rightCollapsed() ? "Expand Context Rail" : "Collapse Context Rail"}
              onClick={() => setRightCollapsed((value) => !value)}
            >
              ⌟
            </button>
          </div>
        </header>
        <div class="relative min-h-0 min-w-0 flex-1 overflow-hidden">
          <main class="h-full min-w-0 overflow-auto bg-bg-panel px-9 py-7" id="stage">
            {props.children}
          </main>
          <Show when={previewOpen() && previewEnabled() ? activeCase() : undefined}>
            {(workCase) => (
              <PreviewSlideOver live={workCase().live} onClose={() => setPreviewOpen(false)} />
            )}
          </Show>
        </div>
      </div>

      <aside
        class="min-w-0 overflow-auto border-l border-border bg-bg-deep p-[12px_10px] transition-[opacity,padding] duration-[160ms] ease-shell group-data-[right-collapsed]/shell:pointer-events-none group-data-[right-collapsed]/shell:overflow-hidden group-data-[right-collapsed]/shell:border-none group-data-[right-collapsed]/shell:p-0 group-data-[right-collapsed]/shell:opacity-0"
        aria-label="Context Rail"
        aria-hidden={rightCollapsed() ? "true" : "false"}
      >
        <ContextRail />
      </aside>
    </div>
  );
};

/**
 * App Shell: desktop Triptych Dock or mobile single-column drawers by viewport.
 */
export const AppShell: ParentComponent = (props) => {
  const isMobile = createMediaQuery(MOBILE_SHELL_QUERY);

  return (
    <Show when={isMobile()} fallback={<DesktopTriptych>{props.children}</DesktopTriptych>}>
      <MobileShell>{props.children}</MobileShell>
    </Show>
  );
};
