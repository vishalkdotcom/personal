import { onSettled, type Component } from "solid-js";
import { resolveWorkMedia, WORK_MEDIA_VIEWER_SIZES } from "../work/work-case-media";

type MediaViewerProps = {
  inventorySrc: string;
  label: string;
  onClose: () => void;
};

/**
 * Shared fullscreen Work Case media viewer — open from a stage slide on mobile or desktop.
 * Pinch-zoom/pan left to the platform; no custom fit sniffing.
 */
export const MediaViewer: Component<MediaViewerProps> = (props) => {
  let closeEl: HTMLButtonElement | undefined;
  const media = () => resolveWorkMedia(props.inventorySrc);

  onSettled(() => {
    closeEl?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      props.onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  });

  return (
    <div
      class="fixed inset-0 z-50 flex flex-col bg-bg"
      role="dialog"
      aria-modal="true"
      aria-label="Media viewer"
    >
      <div class="flex shrink-0 items-center justify-between gap-3 border-b border-border bg-bg-deep px-4 py-2.5">
        <strong class="truncate text-[13px] font-semibold">{props.label}</strong>
        <button
          ref={(el) => {
            closeEl = el;
          }}
          type="button"
          class="grid size-8 shrink-0 place-items-center rounded-md border border-border bg-bg-deep text-sm text-muted hover:bg-bg-hover hover:text-fg"
          aria-label="Close media viewer"
          onClick={() => props.onClose()}
        >
          ✕
        </button>
      </div>

      <div class="flex min-h-0 flex-1 items-center justify-center overflow-auto bg-bg-deep p-4">
        <img
          src={media().src}
          srcset={media().srcSet}
          sizes={WORK_MEDIA_VIEWER_SIZES}
          alt={props.label}
          class="max-h-full max-w-full object-contain"
          decoding="async"
        />
      </div>
    </div>
  );
};
