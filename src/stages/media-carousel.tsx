import { For, Show, createSignal, type Accessor, type Component } from "solid-js";
import type { WorkMediaSlide } from "../work/inventory";
import { resolveWorkMedia, WORK_MEDIA_CAROUSEL_SIZES } from "../work/work-case-media";
import { MediaViewer } from "./media-viewer";

type MediaCarouselProps = {
  slides: WorkMediaSlide[];
};

const CaseMediaSlide: Component<{
  slide: WorkMediaSlide;
  slideIndex: Accessor<number>;
  activeIndex: Accessor<number>;
}> = (props) => {
  const media = resolveWorkMedia(props.slide.src);
  const isActive = () => props.slideIndex() === props.activeIndex();

  return (
    <div
      class="relative grid min-w-full place-items-end justify-items-start bg-bg-deep p-2.5"
      data-case-media-slide
      aria-hidden={isActive() ? undefined : "true"}
    >
      <img
        src={media.src}
        srcset={media.srcSet}
        sizes={WORK_MEDIA_CAROUSEL_SIZES}
        alt={props.slide.label}
        class="absolute inset-0 h-full w-full object-contain"
        loading={isActive() ? "eager" : "lazy"}
        decoding={isActive() ? "auto" : "async"}
      />
      <span class="pointer-events-none relative rounded-md bg-bg-deep/80 px-2 py-1 text-[11px] tracking-[0.06em] text-faint uppercase">
        {props.slide.label}
      </span>
    </div>
  );
};

const SlideDot: Component<{
  slideIndex: Accessor<number>;
  activeIndex: Accessor<number>;
  onSelect: (slideIndex: number) => void;
}> = (props) => {
  const isCurrent = () => props.slideIndex() === props.activeIndex();

  return (
    <button
      type="button"
      class={
        isCurrent()
          ? "size-1.5 rounded-full border-0 bg-accent p-0"
          : "size-1.5 rounded-full border-0 bg-fg/25 p-0"
      }
      aria-label={`Go to slide ${props.slideIndex() + 1}`}
      aria-current={isCurrent() ? "true" : undefined}
      onClick={() => props.onSelect(props.slideIndex())}
    />
  );
};

/**
 * Work Case stage media — labeled slides with prev/next + dots.
 * Contained shots on a muted deep backdrop; activating the stage poster opens the shared fullscreen viewer.
 * Parent should remount this when the Work Case changes so slide index resets.
 */
export const MediaCarousel: Component<MediaCarouselProps> = (props) => {
  const [index, setIndex] = createSignal(0);
  const [viewerOpen, setViewerOpen] = createSignal(false);
  let fullscreenTriggerEl: HTMLButtonElement | undefined;
  const count = () => props.slides.length;
  const go = (next: number) => {
    const n = count();
    if (n === 0) return;
    setIndex(((next % n) + n) % n);
  };
  const activeSlide = () => props.slides[index()];
  const closeViewer = () => {
    setViewerOpen(false);
    fullscreenTriggerEl?.focus();
  };

  return (
    <>
      <section
        class="relative overflow-hidden rounded-xl border border-border"
        aria-roledescription="carousel"
        aria-label="Case media"
      >
        <div
          class="flex aspect-[16/10] transition-transform duration-[220ms] ease-shell"
          style={{ transform: `translateX(-${index() * 100}%)` }}
        >
          <For each={props.slides}>
            {(slide, slideIndex) => (
              <CaseMediaSlide slide={slide} slideIndex={slideIndex} activeIndex={index} />
            )}
          </For>
        </div>

        <Show when={activeSlide()}>
          {(slide) => (
            <button
              ref={(el) => {
                fullscreenTriggerEl = el;
              }}
              type="button"
              class="absolute inset-0 z-0 block border-0 bg-transparent p-0"
              aria-label={`View ${slide().label} fullscreen`}
              onClick={() => setViewerOpen(true)}
            />
          )}
        </Show>

        <div class="pointer-events-none absolute inset-y-0 left-0 right-0 z-[1] flex items-center justify-between px-2">
          <button
            type="button"
            class="pointer-events-auto grid size-8 place-items-center rounded-md border border-border bg-bg-deep/85 text-sm text-muted hover:bg-bg-hover hover:text-fg"
            aria-label="Previous slide"
            onClick={() => go(index() - 1)}
          >
            ‹
          </button>
          <button
            type="button"
            class="pointer-events-auto grid size-8 place-items-center rounded-md border border-border bg-bg-deep/85 text-sm text-muted hover:bg-bg-hover hover:text-fg"
            aria-label="Next slide"
            onClick={() => go(index() + 1)}
          >
            ›
          </button>
        </div>

        <div
          class="absolute bottom-2 left-0 right-0 z-[1] flex justify-center gap-1.5"
          aria-label="Slides"
        >
          <For each={props.slides}>
            {(_, slideIndex) => (
              <SlideDot slideIndex={slideIndex} activeIndex={index} onSelect={go} />
            )}
          </For>
        </div>
      </section>

      <Show when={viewerOpen() ? activeSlide() : undefined}>
        {(slide) => (
          <MediaViewer inventorySrc={slide().src} label={slide().label} onClose={closeViewer} />
        )}
      </Show>
    </>
  );
};
