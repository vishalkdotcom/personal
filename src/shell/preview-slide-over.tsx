import { Show, createSignal, type Component } from "solid-js";
import { isHttpLiveUrl } from "../work/inventory";

type PreviewFrame = "desktop" | "mobile";

type PreviewLayout = "slide-over" | "fullscreen";

type PreviewSlideOverProps = {
  live: string;
  onClose: () => void;
  /** Desktop slide-over (default) or mobile full-screen overlay. */
  layout?: PreviewLayout;
};

function frameButtonClass(active: boolean): string {
  return active
    ? "rounded px-2.5 py-1 text-xs bg-bg-active text-fg"
    : "rounded px-2.5 py-1 text-xs text-muted hover:text-fg";
}

function deviceFrameClass(frame: PreviewFrame): string {
  const base =
    "relative grid place-items-center border border-border bg-[linear-gradient(160deg,#2a3038_0%,#1a2028_55%,#243028_100%)] shadow-[0_16px_48px_rgba(0,0,0,0.4)] transition-[width,height,border-radius] duration-[220ms] ease-shell";
  if (frame === "mobile") {
    return `${base} h-[min(70vh,520px)] w-40 rounded-[22px] border-2`;
  }
  return `${base} h-[min(70vh,520px)] w-[min(100%,860px)] rounded-lg`;
}

/**
 * Public Storefront Preview — desktop slide-over or mobile full-screen overlay.
 * Frames are device chrome labeled with the honest Live URL (embed deferred; hosts often block iframes).
 */
export const PreviewSlideOver: Component<PreviewSlideOverProps> = (props) => {
  const [frame, setFrame] = createSignal<PreviewFrame>("desktop");
  const layout = () => props.layout ?? "slide-over";
  const hostLabel = () =>
    isHttpLiveUrl(props.live) ? props.live.replace(/^https?:\/\//i, "") : (props.live ?? "");

  return (
    <div
      class={
        layout() === "fullscreen"
          ? "absolute inset-0 z-50 flex flex-col bg-bg"
          : "absolute inset-0 z-10 flex flex-col border-t border-border bg-bg shadow-[0_-12px_40px_rgba(0,0,0,0.35)]"
      }
      role="dialog"
      aria-modal="true"
      aria-label="Preview"
      data-preview-layout={layout()}
    >
      <div class="flex shrink-0 items-center justify-between gap-3 border-b border-border bg-bg-deep px-4 py-2.5">
        <strong class="text-[13px] font-semibold">Preview</strong>
        <div class="flex items-center gap-1.5">
          <div
            class="flex rounded-md border border-border bg-bg p-0.5"
            role="group"
            aria-label="Preview frame"
          >
            <button
              type="button"
              class={frameButtonClass(frame() === "desktop")}
              aria-pressed={frame() === "desktop" ? "true" : "false"}
              onClick={() => setFrame("desktop")}
            >
              Desktop
            </button>
            <button
              type="button"
              class={frameButtonClass(frame() === "mobile")}
              aria-pressed={frame() === "mobile" ? "true" : "false"}
              onClick={() => setFrame("mobile")}
            >
              Mobile
            </button>
          </div>
          <button
            type="button"
            class="grid size-8 place-items-center rounded-md border border-border bg-bg-deep text-sm text-muted hover:bg-bg-hover hover:text-fg"
            aria-label="Close Preview"
            onClick={() => props.onClose()}
          >
            ✕
          </button>
        </div>
      </div>

      <div class="flex min-h-0 flex-1 items-center justify-center bg-[#0e1012] p-6">
        <div class={deviceFrameClass(frame())} data-preview-frame={frame()}>
          <div class="px-4 text-center">
            <p class="m-0 text-[11px] tracking-[0.14em] text-faint uppercase">
              Preview · {frame()}
            </p>
            <Show when={isHttpLiveUrl(props.live)}>
              <p class="m-0 mt-2 text-[12.5px] text-muted">{hostLabel()}</p>
            </Show>
          </div>
        </div>
      </div>
    </div>
  );
};
