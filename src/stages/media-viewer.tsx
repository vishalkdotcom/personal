import { For, createEffect, onSettled, type Accessor, type Component } from "solid-js";
import type { WorkMediaSlide } from "../work/inventory";
import { resolveWorkMedia, WORK_MEDIA_VIEWER_SIZES } from "../work/work-case-media";
import { handleCarouselNavKey, isTypingTarget } from "./media-keyboard";

type MediaViewerProps = {
  slides: WorkMediaSlide[];
  index: Accessor<number>;
  onGo: (next: number) => void;
  onClose: () => void;
};

/** Inline inset so end thumbs + current ring stay inside the filmstrip scrollport. */
const FILMSTRIP_GUTTER_PX = 16;

function scrollFilmstripThumbIntoView(strip: HTMLElement, thumb: HTMLElement): void {
  const stripRect = strip.getBoundingClientRect();
  const thumbRect = thumb.getBoundingClientRect();
  const leftBound = stripRect.left + FILMSTRIP_GUTTER_PX;
  const rightBound = stripRect.right - FILMSTRIP_GUTTER_PX;
  if (thumbRect.left < leftBound) {
    strip.scrollLeft -= leftBound - thumbRect.left;
  } else if (thumbRect.right > rightBound) {
    strip.scrollLeft += thumbRect.right - rightBound;
  }
}

/**
 * Fullscreen Work Case media viewer — its own carousel (keys, prev/next, filmstrip)
 * sharing one live index with the stage. Esc/✕ close only; Enter unbound.
 */
export const MediaViewer: Component<MediaViewerProps> = (props) => {
  let closeEl: HTMLButtonElement | undefined;
  let filmstripEl: HTMLElement | undefined;
  const count = () => props.slides.length;
  const activeSlide = () => props.slides[props.index()];
  const media = () => resolveWorkMedia(activeSlide()!.src);

  onSettled(() => {
    closeEl?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (isTypingTarget(event.target)) return;

      if (event.key === "Escape") {
        event.preventDefault();
        props.onClose();
        return;
      }
      handleCarouselNavKey(event, {
        goPrev: () => props.onGo(props.index() - 1),
        goNext: () => props.onGo(props.index() + 1),
        goFirst: () => props.onGo(0),
        goLast: () => props.onGo(count() - 1),
      });
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  });

  createEffect(
    () => props.index(),
    () => {
      const strip = filmstripEl;
      const current = strip?.querySelector<HTMLElement>('[aria-current="true"]');
      if (!strip || !current) return;
      // Keep a gutter at both ends so the current ring isn't clipped by the scrollport.
      scrollFilmstripThumbIntoView(strip, current);
    },
  );

  return (
    <div
      class="fixed inset-0 z-50 flex flex-col bg-bg"
      role="dialog"
      aria-modal="true"
      aria-label="Media viewer"
    >
      <div class="flex shrink-0 items-center justify-between gap-3 border-b border-border bg-bg-deep px-4 py-2.5">
        <strong class="truncate text-[13px] font-semibold">{activeSlide()!.label}</strong>
        <span class="mr-auto ml-2.5 font-mono text-[10px] text-faint">
          {props.index() + 1}/{count()}
        </span>
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

      <div class="relative flex min-h-0 flex-1 items-center justify-center bg-bg-deep p-4">
        <div
          class="max-h-full max-w-full rounded-lg outline-none focus-within:shadow-[0_0_0_3px_var(--color-bg),0_0_0_5px_var(--color-accent)]"
          tabindex="0"
          data-viewer-media
        >
          <div data-media-frame class="max-h-full max-w-full overflow-hidden rounded-lg">
            <img
              src={media().src}
              srcset={media().srcSet}
              sizes={WORK_MEDIA_VIEWER_SIZES}
              alt={activeSlide()!.label}
              class="max-h-full max-w-full object-contain"
              decoding="async"
            />
          </div>
        </div>
        <div class="pointer-events-none absolute inset-0 flex items-center justify-between px-4">
          <button
            type="button"
            class="pointer-events-auto grid size-8 place-items-center rounded-md border border-border bg-bg-deep/85 text-sm text-muted hover:bg-bg-hover hover:text-fg"
            aria-label="Previous slide"
            onClick={() => props.onGo(props.index() - 1)}
          >
            ‹
          </button>
          <button
            type="button"
            class="pointer-events-auto grid size-8 place-items-center rounded-md border border-border bg-bg-deep/85 text-sm text-muted hover:bg-bg-hover hover:text-fg"
            aria-label="Next slide"
            onClick={() => props.onGo(props.index() + 1)}
          >
            ›
          </button>
        </div>
      </div>

      {/*
        Outer scrollport + inner w-max/min-w-full track: center when thumbs fit,
        start-align when they overflow. Inline padding is scrollable content so
        first/last thumbs keep a gutter; scroll helper preserves it on navigate.
      */}
      <div
        ref={(el) => {
          filmstripEl = el;
        }}
        class="overflow-x-auto scroll-px-4 border-t border-border bg-bg"
        role="group"
        aria-label="Slides"
      >
        <div class="flex w-max min-w-full justify-center gap-2 px-4 py-3">
          <For each={props.slides}>
            {(slide, slideIndex) => {
              const isCurrent = () => slideIndex() === props.index();
              const thumb = () => resolveWorkMedia(slide.src);
              return (
                <button
                  type="button"
                  class={
                    isCurrent()
                      ? "h-11 w-[72px] shrink-0 scroll-mx-4 overflow-hidden rounded-md border border-accent p-0 opacity-100 shadow-[0_0_0_2px_var(--color-bg),0_0_0_4px_var(--color-accent)]"
                      : "h-11 w-[72px] shrink-0 scroll-mx-4 overflow-hidden rounded-md border border-border p-0 opacity-55 hover:bg-bg-hover hover:opacity-100"
                  }
                  aria-label={slide.label}
                  aria-current={isCurrent() ? "true" : undefined}
                  onClick={() => props.onGo(slideIndex())}
                >
                  <img
                    src={thumb().src}
                    srcset={thumb().srcSet}
                    sizes="72px"
                    alt=""
                    class="h-full w-full object-cover"
                    decoding="async"
                  />
                </button>
              );
            }}
          </For>
        </div>
      </div>
    </div>
  );
};
