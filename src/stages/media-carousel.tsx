import { For, createSignal, type Component } from "solid-js";
import type { WorkMediaSlide } from "../work/inventory";

const slideTone = [
  "bg-[radial-gradient(ellipse_at_20%_20%,rgba(108,182,255,0.22),transparent_50%),linear-gradient(145deg,#2a323c,#1a2028_50%,#2a322c)]",
  "bg-[radial-gradient(ellipse_at_80%_30%,rgba(232,168,124,0.18),transparent_45%),linear-gradient(145deg,#32282a,#1a2028_50%,#283040)]",
  "bg-[radial-gradient(ellipse_at_40%_70%,rgba(108,182,255,0.14),transparent_50%),linear-gradient(145deg,#243038,#1a2028_50%,#3a3228)]",
];

type MediaCarouselProps = {
  slides: WorkMediaSlide[];
};

/**
 * Default Public Storefront stage media — labeled slides with prev/next + dots.
 * Exact screenshot assets may stay deferred; labels keep the carousel honest.
 */
export const MediaCarousel: Component<MediaCarouselProps> = (props) => {
  const [index, setIndex] = createSignal(0);
  const count = () => props.slides.length;
  const go = (next: number) => {
    const n = count();
    if (n === 0) return;
    setIndex(((next % n) + n) % n);
  };

  return (
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
            <div
              class={`relative grid min-w-full place-items-end justify-items-start p-2.5 ${slideTone[slideIndex() % slideTone.length]}`}
              aria-hidden={slideIndex() === index() ? undefined : "true"}
            >
              {slide.src ? (
                <img
                  src={slide.src}
                  alt={slide.label}
                  class="absolute inset-0 h-full w-full object-cover"
                />
              ) : null}
              <span class="relative rounded-md bg-bg-deep/80 px-2 py-1 text-[11px] tracking-[0.06em] text-faint uppercase">
                {slide.label}
              </span>
            </div>
          )}
        </For>
      </div>

      <div class="pointer-events-none absolute inset-y-0 left-0 right-0 flex items-center justify-between px-2">
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

      <div class="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5" aria-label="Slides">
        <For each={props.slides}>
          {(_, slideIndex) => (
            <button
              type="button"
              class={
                slideIndex() === index()
                  ? "size-1.5 rounded-full border-0 bg-accent p-0"
                  : "size-1.5 rounded-full border-0 bg-fg/25 p-0"
              }
              aria-label={`Go to slide ${slideIndex() + 1}`}
              aria-current={slideIndex() === index() ? "true" : undefined}
              onClick={() => go(slideIndex())}
            />
          )}
        </For>
      </div>
    </section>
  );
};
