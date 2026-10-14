import { A } from "@solidjs/router";
import { For, Show, createEffect, createSignal, onSettled, type Component } from "solid-js";
import {
  ArcadeBossRushWorld,
  ConstellationCosmosWorld,
  KineticBrutalistWorld,
  SpatialWorkstationWorld,
  SynthTelemetryWorld,
} from "./creative-edition-deck";
import {
  SITE_VARIANTS,
  parseVariantParam,
  useSiteVariant,
  type EnrichedWorkItem,
  type SiteVariantId,
} from "./variant-store";

/**
 * Full-Viewport Creative World Host:
 * - Automatically opens whenever `?v=<world>` is present in the URL (`?v=synth`, `?v=cosmos`, `?v=arcade`, `?v=spatial`, `?v=brutalist`).
 * - Can also be toggled anytime from the floating bottom-right World Launcher Dock or via `Alt+1..5`.
 */
export const FullCanvasVariantHost: Component = () => {
  const { variant, setVariant } = useSiteVariant();
  const [fullOpen, setFullOpen] = createSignal(false);
  const [inspectedCase, setInspectedCase] = createSignal<EnrichedWorkItem | null>(null);
  const [resumeModalOpen, setResumeModalOpen] = createSignal(false);

  onSettled(() => {
    try {
      const param = new URLSearchParams(window.location.search).get("v");
      const parsed = parseVariantParam(param);
      if (parsed) {
        setVariant(parsed, false);
        setFullOpen(true);
      }
    } catch {
      // ignore URL parse errors
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && !e.ctrlKey && !e.metaKey) {
        const map: Record<string, SiteVariantId> = {
          "1": "synth",
          "2": "cosmos",
          "3": "arcade",
          "4": "spatial",
          "5": "brutalist",
        };
        const chosen = map[e.key];
        if (chosen) {
          e.preventDefault();
          setVariant(chosen, true);
          setFullOpen(true);
        }
      } else if (e.key === "Escape") {
        if (inspectedCase()) {
          setInspectedCase(null);
        } else if (resumeModalOpen()) {
          setResumeModalOpen(false);
        } else if (fullOpen()) {
          setFullOpen(false);
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  const launchWorld = (id: SiteVariantId) => {
    setVariant(id, true);
    setFullOpen(true);
  };

  return (
    <>
      {/* Floating Bottom-Right World Launcher Dock (hidden on mobile where Hire Signal chip lives) */}
      <div
        class="fixed right-3 bottom-3 z-[90] hidden items-center gap-1 rounded-full border border-white/20 bg-[#0B0F19]/95 px-2.5 py-1.5 text-white shadow-2xl backdrop-blur-md md:flex"
        role="region"
        aria-label="Full-Viewport World Switcher"
        data-full-canvas-dock
      >
        <span class="hidden px-1.5 font-mono text-[10px] font-bold tracking-wider text-cyan-300 uppercase sm:inline">
          5 Worlds:
        </span>
        <For each={SITE_VARIANTS}>
          {(meta) => {
            const isCurrent = () => fullOpen() && variant() === meta.id;
            return (
              <button
                type="button"
                data-launch-world={meta.id}
                onClick={() => launchWorld(meta.id)}
                class={`rounded-full px-2.5 py-1 font-mono text-[11px] font-bold transition ${
                  isCurrent()
                    ? "bg-[#00F5D4] text-black shadow-[0_0_12px_#00F5D4]"
                    : "bg-white/10 text-slate-200 hover:bg-white/20 hover:text-white"
                }`}
                title={`${meta.title} — ${meta.tagline}`}
              >
                {meta.num}·{meta.shortLabel}
              </button>
            );
          }}
        </For>
        <Show when={fullOpen()}>
          <button
            type="button"
            onClick={() => setFullOpen(false)}
            class="ml-1 rounded-full border border-white/20 bg-rose-500/20 px-2.5 py-1 font-mono text-[10px] font-bold text-rose-200 hover:bg-rose-500/35"
            aria-label="Exit Full-Canvas World"
          >
            App Shell ✕
          </button>
        </Show>
      </div>

      {/* Full-Viewport Experience Takeover */}
      <Show when={fullOpen()}>
        <div
          class="fixed inset-0 z-[80] flex flex-col overflow-hidden bg-[#06080E] text-white"
          data-full-canvas-active={variant()}
        >
          {/* Global World Top Navigation Bar */}
          <header class="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-white/15 bg-[#0A0E17] px-4 py-2.5">
            <div class="flex items-center gap-3">
              <span class="rounded bg-[#00F5D4]/15 px-2 py-0.5 font-mono text-[10px] font-bold text-[#00F5D4]">
                VISHALK.COM // WORLD {SITE_VARIANTS.find((v) => v.id === variant())?.num}
              </span>
              <strong class="font-mono text-xs text-white sm:text-sm">
                {SITE_VARIANTS.find((v) => v.id === variant())?.title}
              </strong>
            </div>

            <div class="flex flex-wrap items-center gap-1.5">
              <For each={SITE_VARIANTS}>
                {(meta) => (
                  <button
                    type="button"
                    onClick={() => setVariant(meta.id, true)}
                    class={`rounded-md px-2.5 py-1 font-mono text-xs font-bold transition ${
                      variant() === meta.id
                        ? "bg-[#00F5D4] text-black"
                        : "bg-white/5 text-slate-300 hover:bg-white/15 hover:text-white"
                    }`}
                  >
                    {meta.num} · {meta.shortLabel}
                  </button>
                )}
              </For>
              <button
                type="button"
                onClick={() => setResumeModalOpen(true)}
                class="rounded-md border border-amber-400/40 bg-amber-400/15 px-2.5 py-1 font-mono text-xs font-bold text-amber-200 hover:bg-amber-400/25"
              >
                CV PDF
              </button>
              <button
                type="button"
                onClick={() => setFullOpen(false)}
                class="rounded-md border border-white/20 bg-white/10 px-2.5 py-1 font-mono text-xs font-bold text-white hover:bg-white/20"
              >
                Return to Triptych Shell ✕
              </button>
            </div>
          </header>

          {/* Scrollable World Stage */}
          <main class="min-h-0 flex-1 overflow-y-auto p-4 pb-20 sm:p-6 sm:pb-20">
            <div class="mx-auto max-w-7xl">
              <Show when={variant() === "synth"}>
                <SynthTelemetryWorld onInspectCase={(item) => setInspectedCase(item)} />
              </Show>
              <Show when={variant() === "cosmos"}>
                <ConstellationCosmosWorld onInspectCase={(item) => setInspectedCase(item)} />
              </Show>
              <Show when={variant() === "arcade"}>
                <ArcadeBossRushWorld onInspectCase={(item) => setInspectedCase(item)} />
              </Show>
              <Show when={variant() === "spatial"}>
                <SpatialWorkstationWorld onInspectCase={(item) => setInspectedCase(item)} />
              </Show>
              <Show when={variant() === "brutalist"}>
                <KineticBrutalistWorld onInspectCase={(item) => setInspectedCase(item)} />
              </Show>
            </div>
          </main>
        </div>
      </Show>

      {/* Case Lightbox inside Full-Viewport World */}
      <Show when={inspectedCase()}>
        {(item) => {
          const [slideIdx, setSlideIdx] = createSignal(0);
          createEffect(
            () => item().slug,
            () => {
              setSlideIdx(0);
            },
          );
          const slides = () => item().allMedia.filter((m) => Boolean(m.resolvedSrc));
          const currentSlide = () => slides()[slideIdx()] ?? slides()[0];

          return (
            <div
              class="fixed inset-0 z-[130] flex items-center justify-center bg-black/85 p-4 backdrop-blur-md"
              role="dialog"
              aria-modal="true"
              aria-label={`${item().title} Dossier`}
              onClick={(e) => {
                if (e.target === e.currentTarget) setInspectedCase(null);
              }}
            >
              <div class="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-white/20 bg-[#0B0F17] text-white shadow-2xl">
                <div class="flex items-center justify-between border-b border-white/10 bg-[#111724] px-5 py-3.5">
                  <div class="flex items-center gap-3">
                    <span class="rounded bg-emerald-400/15 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-300 uppercase">
                      {item().folderTitle} · {item().badge}
                    </span>
                    <h3 class="m-0 text-base font-bold">{item().title}</h3>
                  </div>
                  <div class="flex items-center gap-2">
                    <Show when={item().live}>
                      {(liveUrl) => (
                        <a
                          href={liveUrl()}
                          target="_blank"
                          rel="noreferrer"
                          class="rounded-md bg-emerald-400 px-3 py-1 font-mono text-xs font-bold text-black no-underline hover:bg-emerald-300"
                        >
                          Launch Live App ↗
                        </a>
                      )}
                    </Show>
                    <A
                      href={item().href}
                      onClick={() => {
                        setInspectedCase(null);
                        setFullOpen(false);
                      }}
                      class="rounded-md border border-white/20 bg-white/5 px-3 py-1 font-mono text-xs text-white no-underline hover:bg-white/15"
                    >
                      Open Case Route →
                    </A>
                    <button
                      type="button"
                      onClick={() => setInspectedCase(null)}
                      class="rounded-md border border-white/15 bg-white/5 px-2.5 py-1 font-mono text-xs text-white/70 hover:bg-white/15 hover:text-white"
                    >
                      ESC ✕
                    </button>
                  </div>
                </div>

                <div class="grid min-h-0 flex-1 grid-cols-1 gap-5 overflow-y-auto p-5 md:grid-cols-12">
                  <div class="flex flex-col gap-3 md:col-span-7">
                    <Show when={currentSlide()?.resolvedSrc}>
                      {(src) => (
                        <div class="overflow-hidden rounded-xl border border-white/15 bg-black">
                          <img
                            src={src()}
                            alt={currentSlide()?.label ?? item().title}
                            class="max-h-[340px] w-full object-cover object-top"
                          />
                          <div class="flex items-center justify-between border-t border-white/10 bg-[#0D1320] px-3 py-2 font-mono text-[11px] text-white/70">
                            <span>{currentSlide()?.label}</span>
                            <span>
                              Slide {slideIdx() + 1} / {slides().length}
                            </span>
                          </div>
                        </div>
                      )}
                    </Show>
                    <Show when={slides().length > 1}>
                      <div class="flex flex-wrap gap-1.5">
                        <For each={slides()}>
                          {(slide, idx) => (
                            <button
                              type="button"
                              onClick={() => setSlideIdx(idx())}
                              class={`rounded border px-2.5 py-1 font-mono text-[10px] ${
                                slideIdx() === idx()
                                  ? "border-cyan-400 bg-cyan-400/20 text-cyan-200"
                                  : "border-white/10 bg-white/5 text-white/60 hover:text-white"
                              }`}
                            >
                              {idx() + 1}. {slide.label}
                            </button>
                          )}
                        </For>
                      </div>
                    </Show>
                  </div>

                  <div class="flex flex-col justify-between gap-4 md:col-span-5">
                    <div class="space-y-3">
                      <p class="m-0 text-sm leading-relaxed text-slate-200">{item().lede}</p>
                      <div class="space-y-2 border-t border-white/10 pt-3">
                        <For each={item().outcomes}>
                          {(out) => (
                            <div class="rounded-lg border border-white/10 bg-white/[0.03] p-2.5 text-xs leading-relaxed text-slate-300">
                              <strong class="mr-1.5 font-mono text-emerald-300 uppercase">
                                [{out.label}]
                              </strong>
                              {out.text}
                            </div>
                          )}
                        </For>
                      </div>
                    </div>

                    <div class="flex flex-wrap gap-1.5 border-t border-white/10 pt-3">
                      <For each={item().stack}>
                        {(tech) => (
                          <span class="rounded border border-white/15 bg-white/5 px-2 py-0.5 font-mono text-[10px] text-slate-200">
                            {tech}
                          </span>
                        )}
                      </For>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        }}
      </Show>

      {/* Embedded Resume PDF Modal */}
      <Show when={resumeModalOpen()}>
        <div
          class="fixed inset-0 z-[130] flex items-center justify-center bg-black/85 p-4 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-label="Resume PDF Viewer"
          onClick={(e) => {
            if (e.target === e.currentTarget) setResumeModalOpen(false);
          }}
        >
          <div class="flex h-[88vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-white/20 bg-[#0B0F17] text-white">
            <div class="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <strong class="font-mono text-xs">vishal-cv.pdf // Source of Truth</strong>
              <div class="flex items-center gap-2">
                <a
                  href="/vishal-cv.pdf"
                  download
                  class="rounded bg-[#00F5D4] px-3 py-1 font-mono text-xs font-bold text-black no-underline"
                >
                  Download PDF ↓
                </a>
                <button
                  type="button"
                  onClick={() => setResumeModalOpen(false)}
                  class="rounded border border-white/20 px-2.5 py-1 font-mono text-xs text-white"
                >
                  Close ✕
                </button>
              </div>
            </div>
            <iframe src="/vishal-cv.pdf" title="Vishal Kumar CV" class="size-full border-0" />
          </div>
        </div>
      </Show>
    </>
  );
};
