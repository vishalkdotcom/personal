import { A } from "@solidjs/router";
import {
  For,
  Show,
  createEffect,
  createMemo,
  createSignal,
  onSettled,
  type Component,
} from "solid-js";
import {
  ALL_ENRICHED_WORK,
  ARCHITECTURE_PROOFS,
  FACILITY_PARITY_SAMPLES,
  OPEN_SOURCE_EXTRAS,
  PR_155_DEFECTS,
  SITE_VARIANTS,
  useSiteVariant,
  type EnrichedWorkItem,
  type SiteVariantId,
} from "./variant-store";

/* ========================================================================== */
/* WEBAUDIO MICRO-SYNTH ENGINE (Optional user-triggered tactile sound)         */
/* ========================================================================== */
function playSynthTone(freq = 440, durationMs = 110, type: OscillatorType = "triangle") {
  if (typeof window === "undefined") return;
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + durationMs / 1000);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + durationMs / 1000);
    setTimeout(() => {
      void ctx.close().catch(() => {});
    }, durationMs + 60);
  } catch {
    // Ignore audio context restrictions in headless/autoplay environments
  }
}

/* ========================================================================== */
/* SHARED CASE QUICK-INSPECTOR LIGHTBOX MODAL                                 */
/* ========================================================================== */
const CaseQuickInspectorModal: Component<{
  item: EnrichedWorkItem | null;
  onClose: () => void;
}> = (props) => {
  const [slideIdx, setSlideIdx] = createSignal(0);

  createEffect(
    () => props.item?.slug,
    () => {
      setSlideIdx(0);
    },
  );

  return (
    <Show when={props.item}>
      {(item) => {
        const slides = () => item().allMedia.filter((m) => Boolean(m.resolvedSrc));
        const currentSlide = () => slides()[slideIdx()] ?? slides()[0];

        return (
          <div
            class="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
            role="dialog"
            aria-modal="true"
            aria-label={`${item().title} Dossier`}
            onClick={(e) => {
              if (e.target === e.currentTarget) props.onClose();
            }}
          >
            <div class="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-white/20 bg-[#0B0F17] text-white shadow-2xl">
              <div class="flex items-center justify-between border-b border-white/10 bg-[#111724] px-5 py-3.5">
                <div class="flex items-center gap-3">
                  <span class="rounded bg-emerald-400/15 px-2 py-0.5 font-mono text-[10px] font-bold tracking-wider text-emerald-300 uppercase">
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
                    onClick={() => props.onClose()}
                    class="rounded-md border border-white/20 bg-white/5 px-3 py-1 font-mono text-xs text-white no-underline hover:bg-white/15"
                  >
                    Open Full Case →
                  </A>
                  <button
                    type="button"
                    onClick={() => props.onClose()}
                    class="rounded-md border border-white/15 bg-white/5 px-2.5 py-1 font-mono text-xs text-white/70 hover:bg-white/15 hover:text-white"
                  >
                    ESC ✕
                  </button>
                </div>
              </div>

              <div class="grid min-h-0 flex-1 grid-cols-1 gap-5 overflow-y-auto p-5 md:grid-cols-12">
                <div class="flex flex-col gap-3 md:col-span-7">
                  <Show
                    when={currentSlide()?.resolvedSrc}
                    fallback={
                      <div class="flex h-64 items-center justify-center rounded-xl border border-white/10 bg-black/40 font-mono text-xs text-white/50">
                        Internal Architecture Dossier
                      </div>
                    }
                  >
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
                            class={`rounded border px-2.5 py-1 font-mono text-[10px] transition ${
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
                      <div class="font-mono text-[10px] font-bold tracking-wider text-cyan-400 uppercase">
                        Verified Outcomes
                      </div>
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

                  <div class="border-t border-white/10 pt-3">
                    <div class="mb-1.5 font-mono text-[10px] text-white/50 uppercase">
                      Architecture Stack
                    </div>
                    <div class="flex flex-wrap gap-1.5">
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
          </div>
        );
      }}
    </Show>
  );
};

/* ========================================================================== */
/* WORLD 01: MODULAR EURORACK SYNTHESIZER & LIVE CRT OSCILLOSCOPE             */
/* ========================================================================== */
export const SynthTelemetryWorld: Component<{
  onInspectCase: (item: EnrichedWorkItem) => void;
}> = (props) => {
  let crtCanvasRef: HTMLCanvasElement | undefined = undefined;
  const [selectedFacilities, setSelectedFacilities] = createSignal<string[]>(
    FACILITY_PARITY_SAMPLES.map((f) => f.id),
  );
  const [harmonicDrive, setHarmonicDrive] = createSignal(2.08);
  const [lissajousMode, setLissajousMode] = createSignal(false);
  const [soundEnabled, setSoundEnabled] = createSignal(false);
  const [activePatch, setActivePatch] = createSignal<number>(0);

  const toggleFacility = (id: string, index: number) => {
    setSelectedFacilities((prev) => {
      if (prev.includes(id)) {
        if (prev.length <= 2) return prev;
        return prev.filter((item) => item !== id);
      }
      return [...prev, id];
    });
    if (soundEnabled()) {
      playSynthTone(240 + index * 55, 110, "sawtooth");
    }
  };

  const parityMetrics = createMemo(() => {
    const chosen = FACILITY_PARITY_SAMPLES.filter((f) => selectedFacilities().includes(f.id));
    const totalResp = chosen.reduce((acc, f) => acc + f.respondents, 0);
    const totalFav = chosen.reduce((acc, f) => acc + f.favorableCount, 0);
    const questionFirst = totalResp > 0 ? (totalFav / totalResp) * 100 : 0;
    const facilityFirst =
      chosen.length > 0 ? chosen.reduce((acc, f) => acc + f.facilityScore, 0) / chosen.length : 0;
    const drift = Math.abs(questionFirst - facilityFirst);
    return {
      questionFirst: questionFirst.toFixed(2),
      facilityFirst: facilityFirst.toFixed(2),
      drift: drift.toFixed(2),
      driftNum: drift,
      totalResp,
      count: chosen.length,
    };
  });

  onSettled(() => {
    let animId = 0;
    let phase = 0;

    const renderCrt = () => {
      const canvas = crtCanvasRef;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          const w = canvas.width;
          const h = canvas.height;
          ctx.fillStyle = "rgba(3, 16, 13, 0.28)";
          ctx.fillRect(0, 0, w, h);

          // Graticule grid
          ctx.strokeStyle = "rgba(0, 245, 212, 0.11)";
          ctx.lineWidth = 1;
          for (let x = 0; x < w; x += 32) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, h);
            ctx.stroke();
          }
          for (let y = 0; y < h; y += 32) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(w, y);
            ctx.stroke();
          }

          const driftVal = parityMetrics().driftNum;
          const drive = harmonicDrive();

          if (lissajousMode()) {
            // Lissajous phase portrait comparing CH1 vs CH2
            ctx.beginPath();
            ctx.strokeStyle = "#00F5D4";
            ctx.lineWidth = 2.2;
            for (let t = 0; t < Math.PI * 2; t += 0.02) {
              const x = w / 2 + Math.sin(t * drive + phase) * (w * 0.36);
              const y = h / 2 + Math.sin(t * (drive + driftVal * 0.8) + phase * 1.3) * (h * 0.36);
              if (t === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
            }
            ctx.stroke();
          } else {
            // Dual-trace oscilloscope: CH1 Authoritative (Cyan) vs CH2 Facility Drift (Coral)
            ctx.beginPath();
            ctx.strokeStyle = "#FF5E5B";
            ctx.lineWidth = 1.8;
            ctx.setLineDash([5, 4]);
            for (let x = 0; x < w; x += 3) {
              const norm = x / w;
              const y =
                h / 2 +
                Math.sin(norm * Math.PI * 4 * drive + phase + driftVal * 2.5) *
                  (36 + driftVal * 28) +
                Math.cos(norm * 10 - phase) * (driftVal * 18);
              if (x === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
            }
            ctx.stroke();
            ctx.setLineDash([]);

            ctx.beginPath();
            ctx.strokeStyle = "#00F5D4";
            ctx.lineWidth = 2.5;
            ctx.shadowColor = "#00F5D4";
            ctx.shadowBlur = 8;
            for (let x = 0; x < w; x += 3) {
              const norm = x / w;
              const y =
                h / 2 +
                Math.sin(norm * Math.PI * 4 * drive + phase) * 42 +
                Math.sin(norm * Math.PI * 8 + phase * 0.5) * 8;
              if (x === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
            }
            ctx.stroke();
            ctx.shadowBlur = 0;
          }
        }
      }
      phase += 0.045;
      animId = requestAnimationFrame(renderCrt);
    };

    animId = requestAnimationFrame(renderCrt);
    return () => cancelAnimationFrame(animId);
  });

  return (
    <div
      class="min-h-full rounded-2xl border-2 border-[#2D3340] bg-gradient-to-b from-[#171A21] via-[#101218] to-[#0A0C10] p-4 text-slate-100 shadow-2xl"
      data-world="synth"
    >
      {/* Top Eurorack Brushed Rail */}
      <div class="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/10 bg-[#0D0F14] px-4 py-2 font-mono text-[11px]">
        <div class="flex items-center gap-2.5">
          <span class="size-2.5 animate-pulse rounded-full bg-[#00F5D4] shadow-[0_0_8px_#00F5D4]" />
          <span class="font-bold tracking-widest text-[#F5B700]">
            EURORACK // VISHAL KUMAR · SENIOR FRONTEND SYNTHESIS WORKBENCH
          </span>
        </div>
        <div class="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              const next = !soundEnabled();
              setSoundEnabled(next);
              if (next) playSynthTone(523.25, 130, "sine");
            }}
            class={`rounded border px-2.5 py-1 font-mono text-[10px] font-bold transition ${
              soundEnabled()
                ? "border-[#00F5D4] bg-[#00F5D4]/20 text-[#00F5D4]"
                : "border-white/15 bg-white/5 text-slate-400 hover:text-white"
            }`}
          >
            {soundEnabled() ? "AUDIO SYNTH: ON ♪" : "AUDIO SYNTH: MUTED"}
          </button>
          <button
            type="button"
            onClick={() => {
              setLissajousMode((v) => !v);
              if (soundEnabled()) playSynthTone(659.25, 90, "triangle");
            }}
            class="rounded border border-cyan-400/40 bg-cyan-400/10 px-2.5 py-1 font-mono text-[10px] font-bold text-cyan-300 hover:bg-cyan-400/20"
          >
            MODE: {lissajousMode() ? "XY LISSAJOUS" : "DUAL-TRACE WAVE"}
          </button>
        </div>
      </div>

      {/* 3-Module Eurorack Grid */}
      <div class="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* MODULE 01: CARRIER IDENTITY & ANALOG ATTENUVERTERS (4 cols) */}
        <div class="flex flex-col justify-between rounded-xl border border-white/10 bg-[#181C24] p-4 lg:col-span-4">
          <div>
            <div class="mb-3 flex items-center justify-between border-b border-white/10 pb-2 font-mono text-[10px] text-slate-400">
              <span class="font-bold text-white">MOD-01 // CARRIER IDENT</span>
              <span>16 HP</span>
            </div>
            <div class="m-0 text-2xl font-extrabold tracking-tight text-white">Vishal Kumar</div>
            <p class="m-0 mt-1 font-mono text-xs font-bold text-[#00F5D4]">
              Senior Frontend Engineer · React / Next.js / Product UI
            </p>
            <p class="mt-2 text-xs leading-relaxed text-slate-300">
              7+ years building complex React &amp; Next.js product UI for remote teams (13+ years
              total). Reporting surfaces, multilingual admin workflows, and architecture decisions
              backed by counterexamples.
            </p>

            {/* Interactive Harmonic Drive Slider + 3 Hardware Attenuverters */}
            <div class="mt-4 rounded-lg border border-white/10 bg-[#101319] p-3">
              <div class="flex items-center justify-between font-mono text-[10px]">
                <span class="text-slate-400">OSCILLATOR HARMONIC DRIVE</span>
                <span class="font-bold text-[#00F5D4]">{harmonicDrive().toFixed(2)}× SPEEDUP</span>
              </div>
              <input
                type="range"
                min="1"
                max="4"
                step="0.04"
                value={harmonicDrive()}
                aria-label="Oscillator harmonic drive"
                onInput={(e) => setHarmonicDrive(Number.parseFloat(e.currentTarget.value))}
                class="mt-2 w-full accent-[#00F5D4]"
              />
              <div class="mt-3 grid grid-cols-3 gap-2 text-center font-mono">
                <div class="rounded border border-white/10 bg-[#161A22] p-2">
                  <div class="text-sm font-extrabold text-[#00F5D4]">2.08×</div>
                  <div class="text-[9px] text-slate-400">84.5s → 40.6s</div>
                </div>
                <div class="rounded border border-white/10 bg-[#161A22] p-2">
                  <div class="text-sm font-extrabold text-[#FFBE0B]">6 BUGS</div>
                  <div class="text-[9px] text-slate-400">PR #155 GATE</div>
                </div>
                <div class="rounded border border-white/10 bg-[#161A22] p-2">
                  <div class="text-sm font-extrabold text-sky-400">6 OKRs</div>
                  <div class="text-[9px] text-slate-400">PIC SHIPPED</div>
                </div>
              </div>
            </div>
          </div>

          {/* Patch Bay Presets */}
          <div class="mt-4 border-t border-white/10 pt-3">
            <div class="mb-2 font-mono text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              CV Patch Presets (Click to Route Signal)
            </div>
            <div class="grid grid-cols-2 gap-1.5">
              <For each={ARCHITECTURE_PROOFS.slice(0, 4)}>
                {(proof, idx) => (
                  <button
                    type="button"
                    onClick={() => {
                      setActivePatch(idx());
                      if (soundEnabled()) playSynthTone(330 + idx() * 90, 120, "triangle");
                    }}
                    class={`rounded border px-2.5 py-2 text-left font-mono text-[10px] transition ${
                      activePatch() === idx()
                        ? "border-[#00F5D4] bg-[#00F5D4]/15 text-white"
                        : "border-white/10 bg-black/30 text-slate-400 hover:text-white"
                    }`}
                  >
                    <div class="font-bold text-[#00F5D4]">{proof.code}</div>
                    <div class="truncate text-[10px]">{proof.metricBadge}</div>
                  </button>
                )}
              </For>
            </div>
          </div>
        </div>

        {/* MODULE 02: DUAL-TRACE CRT OSCILLOSCOPE & 8-SITE COUNTEREXAMPLE PAD (5 cols) */}
        <div class="flex flex-col justify-between rounded-xl border border-white/10 bg-[#181C24] p-4 lg:col-span-5">
          <div>
            <div class="mb-3 flex items-center justify-between border-b border-white/10 pb-2 font-mono text-[10px] text-slate-400">
              <span class="font-bold text-white">MOD-02 // LIVE SCORE PARITY CRT</span>
              <span class="text-[#00F5D4]">60 FPS PHOSPHOR</span>
            </div>

            {/* Live Canvas CRT Bezel */}
            <div class="relative overflow-hidden rounded-xl border-2 border-[#323A48] bg-[#03100D] p-2 shadow-inner">
              <div class="mb-1.5 flex flex-wrap items-center justify-between gap-2 px-1 font-mono text-[10px]">
                <span class="font-bold text-[#00F5D4]">
                  CH1 QUESTION-FIRST [AUTH]: {parityMetrics().questionFirst}
                </span>
                <span class="font-bold text-[#FF5E5B]">
                  CH2 FACILITY-FIRST [DRIFT]: {parityMetrics().facilityFirst} (Δ{" "}
                  {parityMetrics().drift})
                </span>
              </div>
              <canvas
                ref={(el) => {
                  crtCanvasRef = el;
                }}
                width={420}
                height={165}
                class="h-[165px] w-full rounded border border-emerald-500/20 bg-[#020B09]"
              />
              <div class="mt-1.5 flex items-center justify-between px-1 font-mono text-[10px] text-emerald-300/80">
                <span>
                  Active Sites: {parityMetrics().count}/8 ({parityMetrics().totalResp} respondents)
                </span>
                <span>Authority: Trino → Metabase → Django XLS</span>
              </div>
            </div>

            {/* 8-Facility Step Toggles */}
            <div class="mt-3">
              <div class="mb-1.5 flex items-center justify-between font-mono text-[10px] text-slate-400">
                <span>TOGGLE HOSPITAL / SUPPLIER SITES TO SIMULATE DRIFT</span>
                <div class="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSelectedFacilities(FACILITY_PARITY_SAMPLES.map((f) => f.id))}
                    class="rounded border border-white/15 bg-white/5 px-2 py-0.5 text-[9.5px] text-white hover:bg-white/15"
                  >
                    All 8 (Δ 0.59)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedFacilities(["FAC-01", "FAC-08"])}
                    class="rounded border border-rose-400/30 bg-rose-500/10 px-2 py-0.5 text-[9.5px] text-rose-300 hover:bg-rose-500/20"
                  >
                    Skew Pair (420 vs 38)
                  </button>
                </div>
              </div>
              <div class="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
                <For each={FACILITY_PARITY_SAMPLES}>
                  {(fac, idx) => {
                    const active = () => selectedFacilities().includes(fac.id);
                    return (
                      <button
                        type="button"
                        onClick={() => toggleFacility(fac.id, idx())}
                        class={`rounded border p-1.5 text-left font-mono text-[10px] transition ${
                          active()
                            ? "border-[#00F5D4]/60 bg-[#00F5D4]/10 text-white"
                            : "border-white/10 bg-black/25 text-slate-500 opacity-60"
                        }`}
                      >
                        <div class="flex items-center justify-between font-bold">
                          <span>{fac.id}</span>
                          <span class="text-[#00F5D4]">{fac.facilityScore}%</span>
                        </div>
                        <div class="truncate text-[9px] text-slate-400">n={fac.respondents}</div>
                      </button>
                    );
                  }}
                </For>
              </div>
            </div>
          </div>

          {/* Active Patch Readout */}
          <Show when={ARCHITECTURE_PROOFS[activePatch()]}>
            {(patch) => (
              <div class="mt-3 rounded-lg border border-cyan-400/30 bg-[#0E151F] p-3">
                <div class="flex items-center justify-between font-mono text-[10px] text-cyan-300">
                  <span class="font-bold">
                    {patch().code} // {patch().title}
                  </span>
                  <span class="rounded bg-cyan-400/20 px-1.5 py-0.5">{patch().metricBadge}</span>
                </div>
                <p class="m-0 mt-1.5 text-xs leading-relaxed text-slate-300">{patch().decision}</p>
              </div>
            )}
          </Show>
        </div>

        {/* MODULE 03: SEQUENCER LAUNCHPAD (3 cols) */}
        <div class="flex flex-col justify-between rounded-xl border border-white/10 bg-[#181C24] p-4 lg:col-span-3">
          <div>
            <div class="mb-3 flex items-center justify-between border-b border-white/10 pb-2 font-mono text-[10px] text-slate-400">
              <span class="font-bold text-white">MOD-03 // SYSTEM PADS</span>
              <span>10 CASES</span>
            </div>
            <div class="space-y-2">
              <For each={ALL_ENRICHED_WORK}>
                {(item, idx) => (
                  <button
                    type="button"
                    onClick={() => {
                      if (soundEnabled()) playSynthTone(380 + idx() * 40, 95, "sine");
                      props.onInspectCase(item);
                    }}
                    class="group flex w-full items-center justify-between rounded-lg border border-white/10 bg-[#10131A] px-3 py-2 text-left transition hover:border-[#00F5D4] hover:bg-[#151C26]"
                  >
                    <div class="min-w-0 pr-2">
                      <div class="truncate text-xs font-bold text-white group-hover:text-[#00F5D4]">
                        {item.title}
                      </div>
                      <div class="truncate font-mono text-[9.5px] text-slate-400">
                        {item.folderTitle} · {item.stack.slice(0, 2).join(" / ")}
                      </div>
                    </div>
                    <span
                      class={`shrink-0 rounded px-1.5 py-0.5 font-mono text-[9px] font-bold ${
                        item.live
                          ? "bg-emerald-400/20 text-emerald-300"
                          : "bg-sky-400/15 text-sky-300"
                      }`}
                    >
                      {item.live ? "LIVE ↗" : "DOSSIER"}
                    </span>
                  </button>
                )}
              </For>
            </div>
          </div>

          <div class="mt-4 rounded-lg border border-emerald-400/30 bg-emerald-950/30 p-3 font-mono text-[10px]">
            <div class="font-bold text-emerald-300">● HIRE SIGNAL ACTIVE</div>
            <div class="mt-1 text-slate-300">hello@vishalk.com · Punjab, IN (Remote)</div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ========================================================================== */
/* WORLD 02: CONSTELLATION FORCE-DIRECTED OBSERVATORY                         */
/* ========================================================================== */
type StarNode = {
  id: string;
  label: string;
  sub: string;
  sector: "reporting" | "velocity" | "live" | "ml" | "core";
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  workSlug?: string;
  proofIdx?: number;
};

export const ConstellationCosmosWorld: Component<{
  onInspectCase: (item: EnrichedWorkItem) => void;
}> = (props) => {
  let skyCanvasRef: HTMLCanvasElement | undefined = undefined;
  const [selectedStarId, setSelectedStarId] = createSignal<string>("engage-reporting");
  const [warpFactor, setWarpFactor] = createSignal(1);

  const initialStars: StarNode[] = [
    {
      id: "core",
      label: "VISHAL KUMAR",
      sub: "Senior Frontend · 13+ yrs",
      sector: "core",
      x: 420,
      y: 230,
      vx: 0,
      vy: 0,
      radius: 26,
      color: "#38BDF8",
    },
    {
      id: "engage-reporting",
      label: "Engage Survey Reporting",
      sub: "43 Tickets · OKR 1.0",
      sector: "reporting",
      x: 210,
      y: 110,
      vx: 0,
      vy: 0,
      radius: 14,
      color: "#00F5D4",
      workSlug: "engage-reporting",
    },
    {
      id: "indicator-bank",
      label: "Indicator Bank",
      sub: "4 Admin Surfaces · XLS",
      sector: "reporting",
      x: 135,
      y: 205,
      vx: 0,
      vy: 0,
      radius: 13,
      color: "#00F5D4",
      workSlug: "indicator-bank",
    },
    {
      id: "score-parity",
      label: "54.90 vs 54.31 Proof",
      sub: "Single Scoring Authority",
      sector: "reporting",
      x: 255,
      y: 55,
      vx: 0,
      vy: 0,
      radius: 12,
      color: "#00F5D4",
      proofIdx: 0,
    },
    {
      id: "next16-velocity",
      label: "84.5s → 40.6s Build",
      sub: "2.08× Next.js 16 + De-Barrel",
      sector: "velocity",
      x: 630,
      y: 95,
      vx: 0,
      vy: 0,
      radius: 14,
      color: "#FBBF24",
      proofIdx: 1,
    },
    {
      id: "editor-veto",
      label: "164 vs 350 KiB Veto",
      sub: "Isolated Worktree Bake-Off",
      sector: "velocity",
      x: 710,
      y: 185,
      vx: 0,
      vy: 0,
      radius: 13,
      color: "#FBBF24",
      proofIdx: 2,
    },
    {
      id: "pr155-gate",
      label: "PR #155 Gatekeeper",
      sub: "6 Merge-Blocking Bugs",
      sector: "velocity",
      x: 565,
      y: 55,
      vx: 0,
      vy: 0,
      radius: 12,
      color: "#FBBF24",
      proofIdx: 4,
    },
    {
      id: "supplychain-plus",
      label: "SupplyChain+ [LIVE]",
      sub: "sc-plus.vercel.app",
      sector: "live",
      x: 650,
      y: 330,
      vx: 0,
      vy: 0,
      radius: 15,
      color: "#34D399",
      workSlug: "supplychain-plus",
    },
    {
      id: "promptsurvey",
      label: "PromptSurvey [LIVE]",
      sub: "qgenai.vercel.app",
      sector: "live",
      x: 725,
      y: 270,
      vx: 0,
      vy: 0,
      radius: 14,
      color: "#34D399",
      workSlug: "promptsurvey",
    },
    {
      id: "snap2paper",
      label: "Snap2Paper · PhotoGrid · PDFGrid",
      sub: "Local-First Browser Tools",
      sector: "live",
      x: 560,
      y: 395,
      vx: 0,
      vy: 0,
      radius: 13,
      color: "#34D399",
      workSlug: "snap2paper",
    },
    {
      id: "model-deployment",
      label: "Model Deployment UI",
      sub: "Self-Serve ML Hosting",
      sector: "ml",
      x: 215,
      y: 345,
      vx: 0,
      vy: 0,
      radius: 14,
      color: "#C084FC",
      workSlug: "model-deployment-framework",
    },
    {
      id: "store-dashboard",
      label: "Store Forecast & KPI UI",
      sub: "Actual vs Predicted Sales",
      sector: "ml",
      x: 130,
      y: 295,
      vx: 0,
      vy: 0,
      radius: 13,
      color: "#C084FC",
      workSlug: "store-dashboard",
    },
  ];

  const selectedDetail = createMemo(() => {
    const id = selectedStarId();
    const node = initialStars.find((s) => s.id === id) ?? initialStars[1];
    const workItem = node.workSlug
      ? ALL_ENRICHED_WORK.find((w) => w.slug === node.workSlug)
      : undefined;
    const proofItem =
      node.proofIdx !== undefined ? ARCHITECTURE_PROOFS[node.proofIdx] : ARCHITECTURE_PROOFS[0];
    return { node, workItem, proofItem };
  });

  onSettled(() => {
    let animId = 0;
    let angle = 0;
    let draggingId: string | null = null;

    const nodes = initialStars.map((s) => ({ ...s, baseX: s.x, baseY: s.y }));
    const bgStars = Array.from({ length: 75 }, (_, i) => ({
      x: (i * 137.5) % 840,
      y: (i * 293.3) % 460,
      r: (i % 3) * 0.6 + 0.6,
    }));

    const canvas = skyCanvasRef;
    if (!canvas) return;

    const getCanvasCoords = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: ((e.clientX - rect.left) / rect.width) * canvas.width,
        y: ((e.clientY - rect.top) / rect.height) * canvas.height,
      };
    };

    const onDown = (e: MouseEvent) => {
      const pt = getCanvasCoords(e);
      for (const n of nodes) {
        const dist = Math.hypot(pt.x - n.x, pt.y - n.y);
        if (dist <= n.radius + 14) {
          draggingId = n.id;
          setSelectedStarId(n.id);
          break;
        }
      }
    };

    const onMove = (e: MouseEvent) => {
      if (!draggingId) return;
      const pt = getCanvasCoords(e);
      const n = nodes.find((item) => item.id === draggingId);
      if (n && n.id !== "core") {
        n.x = Math.max(40, Math.min(canvas.width - 40, pt.x));
        n.y = Math.max(40, Math.min(canvas.height - 40, pt.y));
        n.baseX = n.x;
        n.baseY = n.y;
      }
    };

    const onUp = () => {
      draggingId = null;
    };

    canvas.addEventListener("mousedown", onDown);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);

    const tick = () => {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const w = canvas.width;
        const h = canvas.height;
        ctx.fillStyle = "#050914";
        ctx.fillRect(0, 0, w, h);

        // Background stars
        for (const st of bgStars) {
          ctx.fillStyle = "rgba(148, 163, 184, 0.45)";
          ctx.beginPath();
          ctx.arc((st.x + angle * 12 * warpFactor()) % w, st.y, st.r, 0, Math.PI * 2);
          ctx.fill();
        }

        // Celestial radar rings
        ctx.strokeStyle = "rgba(56, 189, 248, 0.12)";
        ctx.setLineDash([4, 6]);
        for (const r of [95, 175, 255]) {
          ctx.beginPath();
          ctx.arc(420, 230, r, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.setLineDash([]);

        // Gentle orbital breathing
        for (const n of nodes) {
          if (n.id !== "core" && n.id !== draggingId) {
            n.x = n.baseX + Math.cos(angle * warpFactor() + n.baseX * 0.02) * 5;
            n.y = n.baseY + Math.sin(angle * warpFactor() + n.baseY * 0.02) * 5;
          }
        }

        // Draw constellation edges from core and within sectors
        const core = nodes[0];
        for (const n of nodes.slice(1)) {
          ctx.beginPath();
          ctx.strokeStyle = n.id === selectedStarId() ? n.color : "rgba(56, 189, 248, 0.22)";
          ctx.lineWidth = n.id === selectedStarId() ? 2.2 : 1.1;
          ctx.moveTo(core.x, core.y);
          ctx.lineTo(n.x, n.y);
          ctx.stroke();
        }

        // Draw star nodes + labels
        for (const n of nodes) {
          const isSel = n.id === selectedStarId();
          if (isSel || n.id === "core") {
            ctx.beginPath();
            ctx.fillStyle = `${n.color}28`;
            ctx.arc(n.x, n.y, n.radius + 9 + Math.sin(angle * 3) * 3, 0, Math.PI * 2);
            ctx.fill();
          }

          ctx.beginPath();
          ctx.fillStyle = n.color;
          ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
          ctx.fill();

          ctx.font = "bold 11px 'JetBrains Mono', monospace";
          ctx.fillStyle = "#F8FAFC";
          ctx.textAlign = "center";
          ctx.fillText(n.label, n.x, n.y + n.radius + 15);

          ctx.font = "10px -apple-system, BlinkMacSystemFont, sans-serif";
          ctx.fillStyle = "#94A3B8";
          ctx.fillText(n.sub, n.x, n.y + n.radius + 28);
        }
      }
      angle += 0.02;
      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener("mousedown", onDown);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  });

  return (
    <div
      class="min-h-full rounded-2xl border border-sky-500/30 bg-[#050914] p-4 text-slate-100 shadow-2xl"
      data-world="cosmos"
    >
      <div class="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-sky-500/20 bg-[#091124] px-4 py-2 font-mono text-[11px]">
        <div class="flex items-center gap-2">
          <span class="size-2 rounded-full bg-sky-400 shadow-[0_0_8px_#38BDF8]" />
          <span class="font-bold text-sky-300">
            OBSERVATORY // DRAG OR CLICK ANY STAR NODE IN THE CONSTELLATION
          </span>
        </div>
        <div class="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setWarpFactor((w) => (w === 1 ? 3.5 : 1))}
            class="rounded border border-sky-400/40 bg-sky-400/15 px-2.5 py-1 font-mono text-[10px] font-bold text-sky-200 hover:bg-sky-400/25"
          >
            ORBIT VELOCITY: {warpFactor() > 1 ? "HYPERWARP 3.5×" : "STANDARD 1.0×"}
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div class="lg:col-span-8">
          <div class="overflow-hidden rounded-xl border border-sky-500/25 bg-[#040710]">
            <canvas
              ref={(el) => {
                skyCanvasRef = el;
              }}
              width={840}
              height={460}
              class="h-[420px] w-full cursor-grab active:cursor-grabbing"
            />
          </div>
          {/* Quick Star Selector Pills */}
          <div class="mt-2.5 flex flex-wrap gap-1.5">
            <For each={initialStars.slice(1)}>
              {(st) => (
                <button
                  type="button"
                  onClick={() => setSelectedStarId(st.id)}
                  class={`rounded-full border px-2.5 py-1 font-mono text-[10px] transition ${
                    selectedStarId() === st.id
                      ? "border-sky-400 bg-sky-400/20 font-bold text-white"
                      : "border-white/10 bg-white/5 text-slate-400 hover:text-white"
                  }`}
                >
                  ★ {st.label}
                </button>
              )}
            </For>
          </div>
        </div>

        {/* Telemetry Telescope Readout */}
        <div class="flex flex-col justify-between rounded-xl border border-white/10 bg-[#0A1224] p-4 lg:col-span-4">
          <Show when={selectedDetail()}>
            {(detail) => (
              <div class="space-y-3">
                <div class="font-mono text-[10px] font-bold tracking-widest text-sky-400 uppercase">
                  TELESCOPE LOCK // {detail().node.sector.toUpperCase()} SECTOR
                </div>
                <h3 class="m-0 text-xl font-extrabold text-white">{detail().node.label}</h3>
                <p class="m-0 font-mono text-xs text-emerald-300">{detail().node.sub}</p>

                <Show
                  when={detail().workItem}
                  fallback={
                    <div class="space-y-2 rounded-lg border border-white/10 bg-black/30 p-3 text-xs text-slate-300">
                      <div class="font-mono text-[10px] font-bold text-amber-300">
                        {detail().proofItem.code} · {detail().proofItem.metricBadge}
                      </div>
                      <p class="m-0 leading-relaxed">{detail().proofItem.tension}</p>
                      <p class="m-0 leading-relaxed text-emerald-200">
                        {detail().proofItem.decision}
                      </p>
                    </div>
                  }
                >
                  {(work) => (
                    <div class="space-y-3">
                      <Show when={work().thumbSrc}>
                        {(src) => (
                          <img
                            src={src()}
                            alt={work().title}
                            class="h-36 w-full rounded-lg border border-white/15 object-cover object-top"
                          />
                        )}
                      </Show>
                      <p class="m-0 text-xs leading-relaxed text-slate-300">{work().lede}</p>
                      <div class="space-y-1.5">
                        <For each={work().outcomes}>
                          {(out) => (
                            <div class="rounded border border-white/10 bg-white/[0.03] p-2 text-[11px] text-slate-200">
                              <strong class="mr-1 font-mono text-sky-300">[{out.label}]</strong>
                              {out.text}
                            </div>
                          )}
                        </For>
                      </div>
                      <div class="flex flex-wrap gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => props.onInspectCase(work())}
                          class="rounded-md bg-sky-400 px-3 py-1.5 font-mono text-xs font-bold text-black hover:bg-sky-300"
                        >
                          Inspect Screenshots ({work().allMedia.length})
                        </button>
                        <Show when={work().live}>
                          {(liveUrl) => (
                            <a
                              href={liveUrl()}
                              target="_blank"
                              rel="noreferrer"
                              class="rounded-md border border-emerald-400/50 bg-emerald-400/15 px-3 py-1.5 font-mono text-xs font-bold text-emerald-300 no-underline hover:bg-emerald-400/25"
                            >
                              Open Live ↗
                            </a>
                          )}
                        </Show>
                      </div>
                    </div>
                  )}
                </Show>
              </div>
            )}
          </Show>

          <div class="mt-4 border-t border-white/10 pt-3 font-mono text-[10px] text-slate-400">
            RA 30° 54' N · DEC 75° 51' E · SolidJS 2 (683ms build / 29.02 kB gz)
          </div>
        </div>
      </div>
    </div>
  );
};

/* ========================================================================== */
/* WORLD 03: 1986 ARCADE BOSS-RUSH PROOF CABINET                              */
/* ========================================================================== */
type BossStage = {
  id: string;
  stageNum: string;
  bossName: string;
  ticket: string;
  maxHp: number;
  attackDesc: string;
  counterMove: string;
  finisherProof: string;
  rewardCaseSlug: string;
};

const BOSS_STAGES: readonly BossStage[] = [
  {
    id: "hydra",
    stageNum: "STAGE 01",
    bossName: "THE SCORE DRIFT HYDRA",
    ticket: "WPM-3469",
    maxHp: 100,
    attackDesc:
      "Dashboard (Metabase) and Excel export (Django/Pandas) report different overall scores across 8 unequal-volume hospital/supplier sites.",
    counterMove: "FIRE 8-SITE COUNTEREXAMPLE (54.31 != 54.90)",
    finisherProof:
      "CRITICAL HIT! Proved Facility-First (54.31) vs Question-First (54.90) diverged. Crowned Trino/Metabase cards the single authority; Django now only validates & pivots.",
    rewardCaseSlug: "engage-reporting",
  },
  {
    id: "golem",
    stageNum: "STAGE 02",
    bossName: "THE 84.5s BUILD GOLEM",
    ticket: "WPM-3019 / 3029 / 3104",
    maxHp: 100,
    attackDesc:
      "Barrel-file re-exports and legacy Next.js config stall every developer build at 84.5s ± 11.4s.",
    counterMove: "DEPLOY NEXT.JS 16 + DE-BARREL + CI CACHE",
    finisherProof:
      "2.08× SPEED COMBO! Quiet-machine hyperfine build dropped from 84.5s to 40.6s. And on vishalk.com, SolidJS 2 cut cold builds to 683ms (29.02 kB gzip).",
    rewardCaseSlug: "indicator-bank",
  },
  {
    id: "trojan",
    stageNum: "STAGE 03",
    bossName: "THE 350 KiB EDITOR TROJAN",
    ticket: "WPM-3487",
    maxHp: 100,
    attackDesc:
      "A candidate rich-text editor promises a 'lighter, cleaner' migration away from MDXEditor.",
    counterMove: "RUN ISOLATED WORKTREE PRODUCTION BAKE-OFF",
    finisherProof:
      "PARRY VETO! Real production bundle showed candidate emitted 350 KiB gzip (10.1 MiB install) vs MDXEditor's 164 KiB gzip (1.8 MiB). Saved the team from a 2.13× heavier rewrite.",
    rewardCaseSlug: "supplychain-plus",
  },
  {
    id: "gauntlet",
    stageNum: "STAGE 04",
    bossName: "THE PR #155 SIX-BUG GAUNTLET",
    ticket: "WPM-3385 / Card 7",
    maxHp: 100,
    attackDesc:
      "A 1,570-line customer-facing analytics migration PR looks green on the happy path but hides 6 production-breaking traps.",
    counterMove: "UNLEASH LINE-BY-LINE DIFF GATEKEEPER",
    finisherProof:
      "6× PERFECT GUARD! Blocked brand-only score lock, swapped question_type 1 & 3, default coercion of free-text, overly broad zeroing guard, stale client filter, and repo-wide @ts-ignore.",
    rewardCaseSlug: "promptsurvey",
  },
];

export const ArcadeBossRushWorld: Component<{
  onInspectCase: (item: EnrichedWorkItem) => void;
}> = (props) => {
  const [stageIdx, setStageIdx] = createSignal(0);
  const [Cleared, setCleared] = createSignal<Record<string, boolean>>({
    hydra: true,
  });
  const [score, setScore] = createSignal(124800);
  const [defectIdx, setDefectIdx] = createSignal(0);

  const currentBoss = () => BOSS_STAGES[stageIdx()] ?? BOSS_STAGES[0];
  const isBossDefeated = () => Boolean(Cleared()[currentBoss().id]);

  const triggerCounterMove = () => {
    const boss = currentBoss();
    if (!Cleared()[boss.id]) {
      setCleared((prev) => ({ ...prev, [boss.id]: true }));
      setScore((s) => s + 50000);
    }
    playSynthTone(587.33, 140, "square");
  };

  return (
    <div
      class="min-h-full rounded-2xl border-2 border-[#FF2A85] bg-[#090314] p-4 text-white shadow-[0_0_50px_rgba(255,42,133,0.2)]"
      data-world="arcade"
    >
      {/* Top Arcade Marquee */}
      <div class="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#FF2A85]/40 bg-[#140829] px-4 py-2.5 font-mono text-xs">
        <span class="font-extrabold text-[#FF2A85]">1UP // VISHAL KUMAR (13+ YRS EXP)</span>
        <span class="font-extrabold tracking-widest text-[#FFE600]">
          HI-SCORE: {score().toLocaleString()} PTS · 124 PRs · 6 OKRs
        </span>
        <span class="font-bold text-[#00F5D4]">CREDIT 99 · OPEN TO ROLES</span>
      </div>

      {/* Stage Select Tabs */}
      <div class="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <For each={BOSS_STAGES}>
          {(boss, idx) => {
            const defeated = () => Boolean(Cleared()[boss.id]);
            return (
              <button
                type="button"
                onClick={() => setStageIdx(idx())}
                class={`rounded-lg border p-2.5 text-left font-mono transition ${
                  stageIdx() === idx()
                    ? "border-[#FFE600] bg-[#241042] text-white shadow-[0_0_15px_rgba(255,230,0,0.25)]"
                    : "border-white/15 bg-[#120722] text-purple-200/70 hover:text-white"
                }`}
              >
                <div class="flex items-center justify-between text-[10px] font-bold">
                  <span class="text-[#FFE600]">{boss.stageNum}</span>
                  <span class={defeated() ? "text-[#00F5D4]" : "text-[#FF2A85]"}>
                    {defeated() ? "★ CLEARED" : "BOSS LIVE"}
                  </span>
                </div>
                <div class="mt-1 truncate text-xs font-extrabold">{boss.bossName}</div>
              </button>
            );
          }}
        </For>
      </div>

      {/* Main Boss Battle Screen */}
      <div class="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div class="flex flex-col justify-between rounded-xl border border-purple-500/30 bg-[#120724] p-5 lg:col-span-7">
          <div>
            <div class="flex flex-wrap items-center justify-between gap-2 font-mono text-xs">
              <span class="rounded bg-[#FF2A85] px-2 py-0.5 font-extrabold text-white">
                {currentBoss().stageNum} // {currentBoss().ticket}
              </span>
              <span class="font-bold text-[#FFE600]">
                BOSS HP: {isBossDefeated() ? "000 / 100 [KO!]" : "100 / 100"}
              </span>
            </div>

            <h2 class="m-0 mt-2 text-2xl font-black tracking-wide text-white">
              {currentBoss().bossName}
            </h2>

            {/* Boss HP Bar */}
            <div class="mt-3 h-4 w-full overflow-hidden rounded-full border border-white/20 bg-black p-0.5">
              <div
                class={`h-full rounded-full transition-all duration-500 ${
                  isBossDefeated()
                    ? "w-0 bg-emerald-400"
                    : "w-full bg-gradient-to-r from-[#FF2A85] to-[#FFE600]"
                }`}
              />
            </div>

            <div class="mt-4 rounded-lg border border-white/10 bg-black/40 p-3.5">
              <div class="font-mono text-[10px] font-bold text-[#FF2A85] uppercase">
                Incoming Production Threat
              </div>
              <p class="m-0 mt-1 text-sm leading-relaxed text-purple-100">
                {currentBoss().attackDesc}
              </p>
            </div>

            {/* Action Button: Fire Counterexample */}
            <div class="mt-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={triggerCounterMove}
                class="rounded-lg bg-gradient-to-r from-[#00F5D4] to-[#00BBF9] px-4 py-2.5 font-mono text-xs font-black text-black shadow-lg transition hover:brightness-110"
              >
                ⚡ {currentBoss().counterMove}
              </button>
              <Show when={ALL_ENRICHED_WORK.find((w) => w.slug === currentBoss().rewardCaseSlug)}>
                {(rewardCase) => (
                  <button
                    type="button"
                    onClick={() => props.onInspectCase(rewardCase())}
                    class="rounded-lg border border-[#FFE600]/60 bg-[#FFE600]/10 px-3.5 py-2.5 font-mono text-xs font-bold text-[#FFE600] hover:bg-[#FFE600]/20"
                  >
                    Inspect Shipped Proof: {rewardCase().title} →
                  </button>
                )}
              </Show>
            </div>

            {/* Finisher Readout */}
            <div class="mt-4 rounded-lg border border-[#00F5D4]/40 bg-[#051B1C] p-3.5">
              <div class="font-mono text-[10px] font-bold text-[#00F5D4] uppercase">
                Verified Finisher Telemetry
              </div>
              <p class="m-0 mt-1 text-xs leading-relaxed text-emerald-100">
                {currentBoss().finisherProof}
              </p>
            </div>
          </div>

          {/* Playable Cartridges Row */}
          <div class="mt-5 border-t border-white/10 pt-3">
            <div class="mb-2 font-mono text-[10px] font-bold text-[#FFE600] uppercase">
              Unlocked Playable Cartridges (Click to Inspect or Launch)
            </div>
            <div class="flex flex-wrap gap-1.5">
              <For each={ALL_ENRICHED_WORK}>
                {(item) => (
                  <button
                    type="button"
                    onClick={() => props.onInspectCase(item)}
                    class="rounded border border-white/15 bg-white/5 px-2.5 py-1 font-mono text-[10px] text-white hover:border-[#00F5D4] hover:text-[#00F5D4]"
                  >
                    [{item.title}]
                  </button>
                )}
              </For>
            </div>
          </div>
        </div>

        {/* Right Column: PR #155 Six-Bug Combo Inspector */}
        <div class="flex flex-col justify-between rounded-xl border border-purple-500/30 bg-[#120724] p-4 lg:col-span-5">
          <div>
            <div class="mb-2 flex items-center justify-between font-mono text-[10px]">
              <span class="font-bold text-[#FFE600]">PR #155 // 6× DEFECT COMBO BREAKER</span>
              <span class="text-[#00F5D4]">CARD 7 MIGRATION</span>
            </div>
            <div class="grid grid-cols-3 gap-1.5 sm:grid-cols-6 lg:grid-cols-3">
              <For each={PR_155_DEFECTS}>
                {(def, idx) => (
                  <button
                    type="button"
                    onClick={() => setDefectIdx(idx())}
                    class={`rounded border px-2 py-1.5 text-left font-mono text-[10px] transition ${
                      defectIdx() === idx()
                        ? "border-[#00F5D4] bg-[#00F5D4]/20 font-bold text-white"
                        : "border-white/10 bg-black/30 text-purple-200/70 hover:text-white"
                    }`}
                  >
                    <div>{def.id}</div>
                    <div class="truncate text-[8.5px] text-[#FF2A85]">{def.severity}</div>
                  </button>
                )}
              </For>
            </div>

            <Show when={PR_155_DEFECTS[defectIdx()]}>
              {(def) => (
                <div class="mt-3 space-y-2.5 rounded-lg border border-white/15 bg-black/50 p-3.5 text-xs">
                  <div class="flex items-center justify-between font-mono text-[10px]">
                    <span class="font-bold text-[#00F5D4]">{def().location}</span>
                    <span class="rounded bg-[#FF2A85]/20 px-1.5 py-0.5 text-[#FF2A85]">
                      {def().severity}
                    </span>
                  </div>
                  <div>
                    <div class="font-mono text-[9.5px] text-purple-300 uppercase">
                      Production Symptom
                    </div>
                    <p class="m-0 mt-0.5 text-slate-200">{def().symptom}</p>
                  </div>
                  <div>
                    <div class="font-mono text-[9.5px] text-amber-300 uppercase">Root Cause</div>
                    <p class="m-0 mt-0.5 text-slate-300">{def().rootCause}</p>
                  </div>
                  <div>
                    <div class="font-mono text-[9.5px] text-emerald-300 uppercase">
                      Review Gate Fix
                    </div>
                    <p class="m-0 mt-0.5 text-emerald-200">{def().fix}</p>
                  </div>
                </div>
              )}
            </Show>
          </div>

          <div class="mt-4 flex items-center justify-between border-t border-white/10 pt-3 font-mono text-[10px] text-purple-200">
            <span>vishalk.com · hello@vishalk.com</span>
            <a
              href="/vishal-cv.pdf"
              target="_blank"
              rel="noreferrer"
              class="font-bold text-[#FFE600] no-underline hover:underline"
            >
              DOWNLOAD CV PDF →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ========================================================================== */
/* WORLD 04: VK-OS // SPATIAL WORKSTATION DESKTOP                             */
/* ========================================================================== */
export const SpatialWorkstationWorld: Component<{
  onInspectCase: (item: EnrichedWorkItem) => void;
}> = (props) => {
  const [activeApp, setActiveApp] = createSignal<"cases" | "terminal" | "bakeoff">("cases");
  const [termHistory, setTermHistory] = createSignal<Array<{ cmd: string; out: string }>>([
    {
      cmd: "vk-os --verify-all",
      out: "[PASS] Score Authority: 54.90 == 54.90 (0% XLS drift) | [PASS] Next 16 Build: 84.5s -> 40.6s (2.08x) | [PASS] Editor Bake-Off: 164 KiB kept vs 350 KiB vetoed",
    },
  ]);

  const runQuickCommand = (cmd: string, out: string) => {
    setTermHistory((prev) => [...prev.slice(-4), { cmd, out }]);
  };

  return (
    <div
      class="min-h-full rounded-2xl border border-white/15 bg-gradient-to-br from-[#0B101E] via-[#111827] to-[#070A12] p-4 text-slate-100 shadow-2xl"
      data-world="spatial"
    >
      {/* Top macOS / FancyZones Menu Bar */}
      <div class="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/10 bg-black/50 px-4 py-2 font-mono text-[11px] backdrop-blur-md">
        <div class="flex items-center gap-3">
          <span class="font-bold text-white"> VK-OS 2026.10</span>
          <span class="text-slate-400">FancyZones 3-Pane Layout</span>
          <span class="hidden text-emerald-400 sm:inline">● Open to Senior Frontend Roles</span>
        </div>
        <div class="flex items-center gap-3 text-slate-300">
          <span>Punjab, IN (UTC+5:30)</span>
          <a
            href="mailto:hello@vishalk.com"
            class="rounded bg-white/10 px-2 py-0.5 text-white no-underline hover:bg-white/20"
          >
            hello@vishalk.com
          </a>
        </div>
      </div>

      {/* Desktop Workspace Area */}
      <div class="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Window 1: System Finder / Case Explorer (7 cols) */}
        <div class="flex flex-col overflow-hidden rounded-xl border border-white/15 bg-[#0F1626]/95 shadow-xl lg:col-span-7">
          <div class="flex items-center justify-between border-b border-white/10 bg-[#182136] px-4 py-2.5">
            <div class="flex items-center gap-2">
              <span class="size-3 rounded-full bg-[#FF5F56]" />
              <span class="size-3 rounded-full bg-[#FFBD2E]" />
              <span class="size-3 rounded-full bg-[#27C93F]" />
              <span class="ml-2 font-mono text-xs font-bold text-white">
                ~/work-dossiers — 10 Shipped Systems
              </span>
            </div>
            <div class="flex gap-1">
              <button
                type="button"
                onClick={() => setActiveApp("cases")}
                class={`rounded px-2 py-0.5 font-mono text-[10px] ${
                  activeApp() === "cases"
                    ? "bg-sky-400 text-black font-bold"
                    : "bg-white/5 text-slate-300"
                }`}
              >
                Visual Grid
              </button>
              <button
                type="button"
                onClick={() => setActiveApp("bakeoff")}
                class={`rounded px-2 py-0.5 font-mono text-[10px] ${
                  activeApp() === "bakeoff"
                    ? "bg-sky-400 text-black font-bold"
                    : "bg-white/5 text-slate-300"
                }`}
              >
                Worktree Benchmarks
              </button>
            </div>
          </div>

          <Show
            when={activeApp() === "cases"}
            fallback={
              <div class="space-y-3 p-4">
                <For each={ARCHITECTURE_PROOFS}>
                  {(proof) => (
                    <div class="rounded-lg border border-white/10 bg-black/30 p-3">
                      <div class="flex items-center justify-between font-mono text-xs">
                        <strong class="text-sky-300">
                          {proof.code} · {proof.title}
                        </strong>
                        <span class="rounded bg-emerald-400/15 px-2 py-0.5 text-[10px] text-emerald-300">
                          {proof.metricBadge}
                        </span>
                      </div>
                      <p class="m-0 mt-1.5 text-xs leading-relaxed text-slate-300">
                        {proof.decision}
                      </p>
                    </div>
                  )}
                </For>
              </div>
            }
          >
            <div class="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2">
              <For each={ALL_ENRICHED_WORK}>
                {(item) => (
                  <button
                    type="button"
                    onClick={() => props.onInspectCase(item)}
                    class="group flex flex-col overflow-hidden rounded-xl border border-white/10 bg-[#151E32] text-left transition hover:border-sky-400"
                  >
                    <Show when={item.thumbSrc}>
                      {(src) => (
                        <div class="h-28 w-full overflow-hidden border-b border-white/10 bg-black">
                          <img
                            src={src()}
                            alt={item.title}
                            loading="lazy"
                            class="size-full object-cover object-left-top transition duration-300 group-hover:scale-105"
                          />
                        </div>
                      )}
                    </Show>
                    <div class="p-3">
                      <div class="flex items-center justify-between gap-2">
                        <strong class="text-xs font-bold text-white group-hover:text-sky-300">
                          {item.title}
                        </strong>
                        <span class="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[9px] text-emerald-300">
                          {item.live ? "LIVE" : item.folderTitle}
                        </span>
                      </div>
                      <p class="m-0 mt-1 line-clamp-2 text-[11px] leading-snug text-slate-300">
                        {item.lede}
                      </p>
                    </div>
                  </button>
                )}
              </For>
            </div>
          </Show>
        </div>

        {/* Right Stack: Interactive Terminal Window + Open Source Dock (5 cols) */}
        <div class="flex flex-col gap-4 lg:col-span-5">
          {/* Window 2: PowerShell 7.4 / Bun Verification Shell */}
          <div class="flex flex-1 flex-col overflow-hidden rounded-xl border border-white/15 bg-[#090D16] shadow-xl">
            <div class="flex items-center justify-between border-b border-white/10 bg-[#141B2B] px-4 py-2">
              <span class="font-mono text-[11px] font-bold text-emerald-300">
                pwsh 7.4 // vk@workstation
              </span>
              <span class="font-mono text-[10px] text-slate-400">Interactive REPL</span>
            </div>
            <div class="flex flex-1 flex-col justify-between p-3.5 font-mono text-xs">
              <div class="space-y-2.5">
                <For each={termHistory()}>
                  {(entry) => (
                    <div class="space-y-1">
                      <div class="text-sky-300">
                        <span class="text-emerald-400">vk@os ❯</span> {entry.cmd}
                      </div>
                      <div class="rounded border border-white/10 bg-white/[0.03] p-2 text-[11px] leading-relaxed text-slate-200">
                        {entry.out}
                      </div>
                    </div>
                  )}
                </For>
              </div>

              <div class="mt-3 border-t border-white/10 pt-2.5">
                <div class="mb-1.5 text-[10px] text-slate-400">CLICK COMMAND TO EXECUTE:</div>
                <div class="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      runQuickCommand(
                        "prove-score-parity --sites=8",
                        "Trino Question-First = 54.90 | Excel Facility-First = 54.31 (Delta 0.59). Solution: Single Trino authority.",
                      )
                    }
                    class="rounded border border-emerald-400/40 bg-emerald-400/10 px-2 py-1 text-[10px] text-emerald-300 hover:bg-emerald-400/20"
                  >
                    prove-score-parity
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      runQuickCommand(
                        "hyperfine 'next build'",
                        "Baseline: 84.5s +/- 11.4s -> After Next 16 + De-Barrel: 40.6s (2.08x speedup).",
                      )
                    }
                    class="rounded border border-sky-400/40 bg-sky-400/10 px-2 py-1 text-[10px] text-sky-300 hover:bg-sky-400/20"
                  >
                    hyperfine-build
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      runQuickCommand(
                        "bakeoff-editor --worktree",
                        "MDXEditor Kept: 164 KiB gz (1.8 MiB) | UIW Candidate Vetoed: 350 KiB gz (10.1 MiB).",
                      )
                    }
                    class="rounded border border-amber-400/40 bg-amber-400/10 px-2 py-1 text-[10px] text-amber-300 hover:bg-amber-400/20"
                  >
                    bakeoff-editor
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Window 3: Open-Source Workstation Repos */}
          <div class="rounded-xl border border-white/15 bg-[#0F1626] p-3.5">
            <div class="mb-2 font-mono text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              Open-Source Engineering Repos
            </div>
            <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <For each={OPEN_SOURCE_EXTRAS}>
                {(repo) => (
                  <a
                    href={repo.href}
                    target="_blank"
                    rel="noreferrer"
                    class="rounded-lg border border-white/10 bg-black/30 p-2.5 no-underline transition hover:border-sky-400"
                  >
                    <div class="font-mono text-xs font-bold text-white">{repo.title} ↗</div>
                    <div class="mt-0.5 font-mono text-[10px] text-sky-300">{repo.stack}</div>
                    <p class="m-0 mt-1 text-[11px] leading-snug text-slate-300">{repo.blurb}</p>
                  </a>
                )}
              </For>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ========================================================================== */
/* WORLD 05: SWISS KINETIC BRUTALIST EXHIBITION POSTER                        */
/* ========================================================================== */
export const KineticBrutalistWorld: Component<{
  onInspectCase: (item: EnrichedWorkItem) => void;
}> = (props) => {
  const [hoveredWork, setHoveredWork] = createSignal<EnrichedWorkItem>(ALL_ENRICHED_WORK[0]);

  return (
    <div
      class="min-h-full rounded-none border-4 border-[#111110] bg-[#F4F0E6] p-5 text-[#111110] shadow-2xl"
      data-world="brutalist"
    >
      {/* Top Swiss Registration Header */}
      <div class="flex flex-wrap items-center justify-between gap-2 border-b-4 border-[#111110] pb-3 font-mono text-xs font-extrabold uppercase">
        <span>EXHIBITION 2026 // PUNJAB, INDIA (REMOTE)</span>
        <span class="bg-[#E63926] px-2.5 py-0.5 text-white">● OPEN TO SENIOR FRONTEND ROLES</span>
        <span>VISHALK.COM // HELLO@VISHALK.COM</span>
      </div>

      {/* Monumental Display Title */}
      <div class="grid grid-cols-1 items-end gap-4 border-b-4 border-[#111110] py-6 lg:grid-cols-12">
        <div class="lg:col-span-9">
          <h2 class="m-0 text-5xl leading-[0.92] font-black tracking-tighter uppercase sm:text-7xl">
            VISHAL KUMAR
          </h2>
          <p class="m-0 mt-3 text-base font-bold text-[#3D3B36] sm:text-lg">
            Senior Frontend Engineer — Complex Reporting Surfaces, Multilingual Admin Platforms
            &amp; Evidence-Led Architecture
          </p>
        </div>
        <div class="flex flex-col justify-center bg-[#E63926] p-4 text-white lg:col-span-3">
          <div class="font-mono text-3xl font-black">13+ YRS</div>
          <div class="font-mono text-xs font-bold uppercase">7+ Years React &amp; Next.js</div>
        </div>
      </div>

      {/* 4 Monumental Proof Columns */}
      <div class="grid grid-cols-1 border-b-4 border-[#111110] sm:grid-cols-2 lg:grid-cols-4">
        <div class="border-b-2 border-[#111110] p-4 sm:border-r-2 lg:border-b-0">
          <div class="font-mono text-xs font-black text-[#E63926]">01 // SCORE AUTHORITY</div>
          <div class="mt-2 text-4xl font-black tracking-tight">54.90 ≠ 54.31</div>
          <p class="m-0 mt-2 text-xs leading-relaxed font-semibold text-[#2E2D2A]">
            Proved 8-facility formula drift. Made Trino/Metabase cards the single authority; Django
            validates &amp; pivots into XLS with zero duplicate math.
          </p>
        </div>

        <div class="border-b-2 border-[#111110] p-4 lg:border-r-2 lg:border-b-0">
          <div class="font-mono text-xs font-black text-[#1746A2]">02 // BUILD VELOCITY</div>
          <div class="mt-2 text-4xl font-black tracking-tight">2.08× FASTER</div>
          <p class="m-0 mt-2 text-xs leading-relaxed font-semibold text-[#2E2D2A]">
            Cut production Next.js build from 84.5s to 40.6s via self-initiated Next.js 16 upgrade,
            barrel removal, and cached CI pipeline.
          </p>
        </div>

        <div class="border-b-2 border-[#111110] p-4 sm:border-r-2 sm:border-b-0">
          <div class="font-mono text-xs font-black text-[#157F3D]">03 // CONFIDENT VETO</div>
          <div class="mt-2 text-4xl font-black tracking-tight">164 vs 350K</div>
          <p class="m-0 mt-2 text-xs leading-relaxed font-semibold text-[#2E2D2A]">
            Isolated worktree production bake-off proved candidate editor emitted 350 KiB gzip (10.1
            MiB install) vs 164 KiB. Vetoed the rewrite.
          </p>
        </div>

        <div class="p-4">
          <div class="font-mono text-xs font-black text-[#E63926]">04 // REVIEW GATE</div>
          <div class="mt-2 text-4xl font-black tracking-tight">6 BLOCKERS</div>
          <p class="m-0 mt-2 text-xs leading-relaxed font-semibold text-[#2E2D2A]">
            Caught 6 merge-blocking bugs in PR #155 before merge: brand-only score lock, swapped
            question_type 1&amp;3, and zeroed API payload guard.
          </p>
        </div>
      </div>

      {/* Interactive Brutalist Exhibition Index + Live Preview Plate */}
      <div class="grid grid-cols-1 gap-6 pt-5 lg:grid-cols-12">
        <div class="lg:col-span-7">
          <div class="mb-2 font-mono text-xs font-black uppercase">
            INDEX OF SHIPPED SYSTEMS (HOVER TO PREVIEW · CLICK TO INSPECT)
          </div>
          <div class="divide-y-2 divide-[#111110] border-2 border-[#111110]">
            <For each={ALL_ENRICHED_WORK}>
              {(item, idx) => (
                <button
                  type="button"
                  onMouseEnter={() => setHoveredWork(item)}
                  onFocus={() => setHoveredWork(item)}
                  onClick={() => props.onInspectCase(item)}
                  class="flex w-full items-center justify-between gap-3 bg-[#F4F0E6] px-3.5 py-2.5 text-left transition hover:bg-[#111110] hover:text-[#F4F0E6]"
                >
                  <div class="flex items-baseline gap-3">
                    <span class="font-mono text-xs font-black text-[#E63926]">0{idx() + 1}</span>
                    <strong class="text-sm font-black uppercase">{item.title}</strong>
                    <span class="hidden font-mono text-[11px] opacity-75 sm:inline">
                      — {item.folderTitle}
                    </span>
                  </div>
                  <span class="font-mono text-[11px] font-bold uppercase">
                    {item.live ? "LIVE APP ↗" : "DOSSIER →"}
                  </span>
                </button>
              )}
            </For>
          </div>
        </div>

        {/* Active Exhibition Plate */}
        <div class="flex flex-col justify-between border-2 border-[#111110] bg-[#ECE7DA] p-4 lg:col-span-5">
          <div>
            <div class="flex items-center justify-between font-mono text-xs font-black uppercase">
              <span>PLATE PREVIEW // {hoveredWork().folderTitle}</span>
              <span class="bg-[#111110] px-2 py-0.5 text-[#F4F0E6]">{hoveredWork().badge}</span>
            </div>
            <Show when={hoveredWork().thumbSrc}>
              {(src) => (
                <div class="mt-3 overflow-hidden border-2 border-[#111110] bg-black">
                  <img
                    src={src()}
                    alt={hoveredWork().title}
                    class="h-48 w-full object-cover object-top"
                  />
                </div>
              )}
            </Show>
            <h3 class="m-0 mt-3 text-xl font-black uppercase">{hoveredWork().title}</h3>
            <p class="m-0 mt-1 text-xs leading-relaxed font-semibold text-[#2E2D2A]">
              {hoveredWork().lede}
            </p>
          </div>

          <div class="mt-4 flex flex-wrap gap-2 border-t-2 border-[#111110] pt-3">
            <button
              type="button"
              onClick={() => props.onInspectCase(hoveredWork())}
              class="bg-[#111110] px-3.5 py-2 font-mono text-xs font-black text-[#F4F0E6] uppercase hover:bg-[#E63926]"
            >
              Open Full Visual Dossier →
            </button>
            <Show when={hoveredWork().live}>
              {(liveUrl) => (
                <a
                  href={liveUrl()}
                  target="_blank"
                  rel="noreferrer"
                  class="border-2 border-[#111110] bg-white px-3.5 py-2 font-mono text-xs font-black text-[#111110] uppercase no-underline hover:bg-[#111110] hover:text-white"
                >
                  Launch Live ↗
                </a>
              )}
            </Show>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ========================================================================== */
/* INLINE STAGE DECK (Mounted in `/` and `/about`)                            */
/* ========================================================================== */
export const CreativeEditionDeck: Component = () => {
  const { variant, setVariant } = useSiteVariant();
  const [inspectedCase, setInspectedCase] = createSignal<EnrichedWorkItem | null>(null);

  return (
    <section
      class="mt-8 border-t border-border pt-6"
      aria-label="Interactive Creative Worlds"
      data-creative-deck
    >
      <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div class="font-mono text-[10px] font-bold tracking-[0.14em] text-accent uppercase">
            5 Interactive Worlds · Pick Your Experience
          </div>
          <h2 class="m-0 mt-0.5 text-base font-bold text-fg">
            Live Engineering Worlds (Zero Boilerplate)
          </h2>
        </div>

        {/* 5-World Switcher Pills */}
        <div
          class="flex flex-wrap items-center gap-1.5 rounded-xl border border-border bg-bg-deep p-1"
          role="group"
          aria-label="Creative world switcher"
        >
          <For each={SITE_VARIANTS}>
            {(meta) => {
              const active = () => variant() === meta.id;
              return (
                <button
                  type="button"
                  aria-pressed={active() ? "true" : "false"}
                  data-variant-tab={meta.id}
                  onClick={() => setVariant(meta.id as SiteVariantId, true)}
                  class={`rounded-lg px-2.5 py-1.5 font-mono text-xs transition ${
                    active()
                      ? "bg-accent font-bold text-white shadow-sm"
                      : "text-muted hover:bg-bg-hover hover:text-fg"
                  }`}
                >
                  <span class="mr-1 opacity-75">{meta.num}</span>
                  {meta.shortLabel}
                </button>
              );
            }}
          </For>
        </div>
      </div>

      {/* Active World Viewport */}
      <div class="min-w-0">
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

      <CaseQuickInspectorModal item={inspectedCase()} onClose={() => setInspectedCase(null)} />
    </section>
  );
};
