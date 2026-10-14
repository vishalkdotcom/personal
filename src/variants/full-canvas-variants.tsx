import { For, Match, Show, Switch, createSignal, onSettled, type Component } from "solid-js";
import { ABOUT_META, ABOUT_NAME, ABOUT_PITCH, BASED_LOCATION } from "../about/content";
import { CONTACT_EMAIL } from "../contact/content";
import { RESUME_PDF_HREF, RESUME_PDF_TITLE } from "../resume/content";
import { ThemeControl } from "../theme/theme-control";
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

/* ============================================================================
 * SHARED LIGHTBOX / CASE DRAWER FOR FULL-BLEED CANVAS VARIANTS
 * ========================================================================== */
const CaseQuickInspectorModal: Component<{
  item: EnrichedWorkItem | null;
  onClose: () => void;
}> = (props) => {
  const [slideIdx, setSlideIdx] = createSignal(0);

  return (
    <Show when={props.item}>
      {(activeItem) => {
        const mediaList = () => activeItem().allMedia.filter((m) => m.resolvedSrc);
        const currentMedia = () => mediaList()[slideIdx()] ?? mediaList()[0];

        return (
          <div
            class="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs"
            role="dialog"
            aria-modal="true"
            aria-label={`${activeItem().title} quick dossier`}
            onClick={(e) => {
              if (e.target === e.currentTarget) props.onClose();
            }}
          >
            <div class="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-border bg-bg-panel shadow-2xl">
              <div class="flex items-center justify-between gap-3 border-b border-border bg-bg-deep px-5 py-3.5">
                <div class="flex items-center gap-2.5">
                  <span class="rounded bg-accent-soft px-2 py-0.5 font-mono text-[10px] font-semibold text-accent uppercase">
                    {activeItem().folderTitle}
                  </span>
                  <h3 class="m-0 text-base font-bold text-fg">{activeItem().title}</h3>
                  <span class="font-mono text-[11px] text-faint">· {activeItem().badge}</span>
                </div>
                <div class="flex items-center gap-2">
                  <Show when={activeItem().live}>
                    {(liveUrl) => (
                      <a
                        href={liveUrl()}
                        target="_blank"
                        rel="noreferrer"
                        class="rounded-md bg-accent px-3 py-1 font-mono text-xs font-semibold text-white no-underline hover:opacity-90"
                      >
                        Open Live App ↗
                      </a>
                    )}
                  </Show>
                  <button
                    type="button"
                    onClick={() => props.onClose()}
                    class="rounded-md border border-border bg-bg px-2.5 py-1 font-mono text-xs text-muted hover:bg-bg-hover hover:text-fg"
                  >
                    ESC ✕
                  </button>
                </div>
              </div>

              <div class="vk-scroll grid flex-1 grid-cols-1 gap-5 overflow-y-auto p-5 lg:grid-cols-[1.25fr_1fr]">
                <div>
                  <Show
                    when={currentMedia()?.resolvedSrc}
                    fallback={
                      <div class="grid h-64 place-items-center rounded-xl border border-dashed border-border bg-bg-deep font-mono text-xs text-faint">
                        Internal Architecture Dossier
                      </div>
                    }
                  >
                    {(src) => (
                      <div>
                        <div class="overflow-hidden rounded-xl border border-border bg-bg-deep">
                          <img
                            src={src()}
                            alt={currentMedia()?.label ?? activeItem().title}
                            class="h-[290px] w-full object-contain"
                          />
                        </div>
                        <div class="mt-2 flex items-center justify-between gap-2">
                          <span class="font-mono text-[11px] text-muted">
                            {currentMedia()?.label}
                          </span>
                          <Show when={mediaList().length > 1}>
                            <div class="flex gap-1">
                              <For each={mediaList()}>
                                {(slide, idx) => (
                                  <button
                                    type="button"
                                    onClick={() => setSlideIdx(idx())}
                                    class={[
                                      "rounded px-2 py-0.5 font-mono text-[10px]",
                                      slideIdx() === idx()
                                        ? "bg-accent text-white"
                                        : "bg-bg-deep text-muted hover:bg-bg-hover",
                                    ].join(" ")}
                                  >
                                    {idx() + 1}
                                  </button>
                                )}
                              </For>
                            </div>
                          </Show>
                        </div>
                      </div>
                    )}
                  </Show>
                </div>

                <div class="flex flex-col justify-between space-y-4">
                  <div>
                    <div class="font-mono text-[10px] tracking-[0.1em] text-faint uppercase">
                      System Overview
                    </div>
                    <p class="m-0 mt-1 text-sm leading-relaxed text-fg">{activeItem().lede}</p>

                    <div class="mt-4 font-mono text-[10px] tracking-[0.1em] text-faint uppercase">
                      Verified Outcomes
                    </div>
                    <ul class="m-0 mt-1.5 list-none space-y-2 p-0">
                      <For each={activeItem().outcomes}>
                        {(outcome) => (
                          <li class="rounded-lg border border-border bg-bg-deep p-2.5 text-xs leading-relaxed">
                            <span class="font-mono font-semibold text-accent">
                              {outcome.label}:{" "}
                            </span>
                            <span class="text-muted">{outcome.text}</span>
                          </li>
                        )}
                      </For>
                    </ul>
                  </div>

                  <div>
                    <div class="font-mono text-[10px] tracking-[0.1em] text-faint uppercase">
                      Stack
                    </div>
                    <div class="mt-1.5 flex flex-wrap gap-1.5">
                      <For each={activeItem().stack}>
                        {(tech) => (
                          <span class="rounded-md border border-border bg-bg-deep px-2 py-0.5 font-mono text-[11px] text-muted">
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

/* ============================================================================
 * CANVAS VARIANT 01 · THE PROOF LEDGER & COUNTEREXAMPLE LAB
 * Full-bleed Swiss architectural ledger with live facility drift simulator,
 * hyperfine build & gzip bars, and visual system cards.
 * ========================================================================== */
const FullCanvasLedger: Component<{
  onInspectCase: (item: EnrichedWorkItem) => void;
  onOpenResume: () => void;
}> = (props) => {
  const [selectedFacilities, setSelectedFacilities] = createSignal<Record<string, boolean>>({
    "FAC-01": true,
    "FAC-02": true,
    "FAC-03": true,
    "FAC-04": true,
    "FAC-05": true,
    "FAC-06": true,
    "FAC-07": true,
    "FAC-08": true,
  });

  const activeRows = () =>
    FACILITY_PARITY_SAMPLES.filter((row) => selectedFacilities()[row.id] !== false);

  const metrics = () => {
    const rows = activeRows();
    const totalRespondents = rows.reduce((sum, r) => sum + r.respondents, 0);
    const totalFavorable = rows.reduce((sum, r) => sum + r.favorableCount, 0);
    const questionFirst = totalRespondents > 0 ? (totalFavorable / totalRespondents) * 100 : 0;
    const facilityFirst =
      rows.length > 0 ? rows.reduce((sum, r) => sum + r.facilityScore, 0) / rows.length : 0;
    const drift = questionFirst - facilityFirst;
    return { totalRespondents, questionFirst, facilityFirst, drift };
  };

  const toggleFacility = (id: string) => {
    setSelectedFacilities((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      if (!Object.values(next).some(Boolean)) return prev;
      return next;
    });
  };

  const applyPreset = (preset: "all" | "two" | "skew") => {
    if (preset === "all") {
      setSelectedFacilities({
        "FAC-01": true,
        "FAC-02": true,
        "FAC-03": true,
        "FAC-04": true,
        "FAC-05": true,
        "FAC-06": true,
        "FAC-07": true,
        "FAC-08": true,
      });
    } else if (preset === "two") {
      setSelectedFacilities({
        "FAC-01": true,
        "FAC-02": false,
        "FAC-03": false,
        "FAC-04": false,
        "FAC-05": false,
        "FAC-06": true,
        "FAC-07": false,
        "FAC-08": false,
      });
    } else {
      setSelectedFacilities({
        "FAC-01": true,
        "FAC-02": true,
        "FAC-03": false,
        "FAC-04": false,
        "FAC-05": false,
        "FAC-06": false,
        "FAC-07": false,
        "FAC-08": true,
      });
    }
  };

  return (
    <div class="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-8">
      {/* Swiss Architectural Header */}
      <header class="grid grid-cols-1 gap-6 rounded-2xl border border-border bg-bg-panel p-6 lg:grid-cols-[1.5fr_1fr]">
        <div>
          <div class="inline-flex items-center gap-2 rounded-full border border-ok/30 bg-bg-deep px-3 py-1 font-mono text-[11px] text-ok">
            <span class="size-2 rounded-full bg-ok" />
            OPEN TO REMOTE SENIOR FRONTEND ROLES · {BASED_LOCATION.toUpperCase()}
          </div>
          <h1 class="m-0 mt-3 text-3xl font-bold tracking-[-0.03em] text-fg sm:text-4xl">
            {ABOUT_NAME}
          </h1>
          <p class="m-0 mt-1.5 font-mono text-xs text-accent">{ABOUT_META}</p>
          <p class="m-0 mt-3 max-w-2xl text-sm leading-relaxed text-muted">{ABOUT_PITCH}</p>
          <div class="mt-4 flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => props.onOpenResume()}
              class="rounded-lg bg-accent px-3.5 py-2 text-xs font-semibold text-white hover:opacity-90"
            >
              Inspect Resume (PDF)
            </button>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              class="rounded-lg border border-border bg-bg-deep px-3.5 py-2 font-mono text-xs text-fg no-underline hover:bg-bg-hover"
            >
              {CONTACT_EMAIL}
            </a>
            <a
              href="https://github.com/vishalkdotcom"
              target="_blank"
              rel="noreferrer"
              class="rounded-lg border border-border bg-bg-deep px-3 py-2 font-mono text-xs text-muted no-underline hover:bg-bg-hover hover:text-fg"
            >
              GitHub ↗
            </a>
            <a
              href="https://www.linkedin.com/in/vishalkdotcom"
              target="_blank"
              rel="noreferrer"
              class="rounded-lg border border-border bg-bg-deep px-3 py-2 font-mono text-xs text-muted no-underline hover:bg-bg-hover hover:text-fg"
            >
              LinkedIn ↗
            </a>
          </div>
        </div>

        {/* Key Quantitative Signals */}
        <div class="grid grid-cols-2 gap-2.5">
          <div class="rounded-xl border border-border bg-bg-deep p-3.5">
            <div class="font-mono text-[10px] text-faint uppercase">Production Build</div>
            <div class="mt-1 font-mono text-xl font-bold tabular-nums text-ok">84.5s → 40.6s</div>
            <div class="mt-0.5 text-[11px] text-muted">
              2.08× faster via Next.js 16 + de-barrel + CI cache (hyperfine)
            </div>
          </div>
          <div class="rounded-xl border border-border bg-bg-deep p-3.5">
            <div class="font-mono text-[10px] text-faint uppercase">Scoring Authority</div>
            <div class="mt-1 font-mono text-xl font-bold tabular-nums text-accent">
              71.47 vs 71.40
            </div>
            <div class="mt-0.5 text-[11px] text-muted">
              Counterexample harness unified Trino BI &amp; Django Excel
            </div>
          </div>
          <div class="rounded-xl border border-border bg-bg-deep p-3.5">
            <div class="font-mono text-[10px] text-faint uppercase">Bundle Discipline</div>
            <div class="mt-1 font-mono text-xl font-bold tabular-nums text-fg">164 vs 350 KiB</div>
            <div class="mt-0.5 text-[11px] text-muted">
              Worktree bake-off stopped a 2.13× heavier editor migration
            </div>
          </div>
          <div class="rounded-xl border border-border bg-bg-deep p-3.5">
            <div class="font-mono text-[10px] text-faint uppercase">Proactive Ownership</div>
            <div class="mt-1 font-mono text-xl font-bold tabular-nums text-warn">
              36% Self-Filed
            </div>
            <div class="mt-0.5 text-[11px] text-muted">
              61 of 168 tickets self-initiated · 124 PRs across 6 repos
            </div>
          </div>
        </div>
      </header>

      {/* Interactive Counterexample Simulator + Telemetry */}
      <section class="grid grid-cols-1 gap-5 lg:grid-cols-[1.35fr_1fr]">
        <div class="rounded-2xl border border-border bg-bg-panel p-5">
          <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <div class="font-mono text-[10px] tracking-[0.1em] text-accent uppercase">
                LIVE PROOF SIMULATOR · TRINO SQL VS PANDAS AGGREGATION
              </div>
              <h2 class="m-0 mt-0.5 text-base font-bold text-fg">
                Toggle Facilities to Observe Question-First vs. Facility-First Drift
              </h2>
            </div>
            <div class="flex gap-1 font-mono text-[10px]">
              <button
                type="button"
                onClick={() => applyPreset("all")}
                class="rounded border border-border bg-bg-deep px-2 py-1 text-muted hover:bg-bg-hover hover:text-fg"
              >
                All 8 Sites
              </button>
              <button
                type="button"
                onClick={() => applyPreset("two")}
                class="rounded border border-border bg-bg-deep px-2 py-1 text-muted hover:bg-bg-hover hover:text-fg"
              >
                2-Site Pair
              </button>
              <button
                type="button"
                onClick={() => applyPreset("skew")}
                class="rounded border border-border bg-bg-deep px-2 py-1 text-muted hover:bg-bg-hover hover:text-fg"
              >
                Headcount Skew
              </button>
            </div>
          </div>

          <div class="mb-4 grid grid-cols-3 gap-2.5">
            <div class="rounded-xl border border-ok/30 bg-bg-deep p-3">
              <div class="font-mono text-[10px] text-ok uppercase">Question-First (Truth)</div>
              <div class="mt-1 font-mono text-2xl font-bold tabular-nums text-fg">
                {metrics().questionFirst.toFixed(2)}%
              </div>
              <div class="font-mono text-[10px] text-faint">
                N = {metrics().totalRespondents} respondents
              </div>
            </div>
            <div class="rounded-xl border border-warn/30 bg-bg-deep p-3">
              <div class="font-mono text-[10px] text-warn uppercase">Facility-First (Legacy)</div>
              <div class="mt-1 font-mono text-2xl font-bold tabular-nums text-fg">
                {metrics().facilityFirst.toFixed(2)}%
              </div>
              <div class="font-mono text-[10px] text-faint">
                Mean of {activeRows().length} site means
              </div>
            </div>
            <div class="rounded-xl border border-accent/30 bg-accent-soft p-3">
              <div class="font-mono text-[10px] text-accent uppercase">Discrepancy (Δ)</div>
              <div class="mt-1 font-mono text-2xl font-bold tabular-nums text-accent">
                {metrics().drift >= 0 ? "+" : ""}
                {metrics().drift.toFixed(2)} pts
              </div>
              <div class="font-mono text-[10px] text-muted">Fixed via single authority</div>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <For each={[...FACILITY_PARITY_SAMPLES]}>
              {(row) => {
                const active = () => selectedFacilities()[row.id] !== false;
                return (
                  <button
                    type="button"
                    onClick={() => toggleFacility(row.id)}
                    aria-pressed={active() ? "true" : "false"}
                    class={[
                      "rounded-lg border p-2.5 text-left transition-colors",
                      active()
                        ? "border-border bg-bg-deep text-fg"
                        : "border-transparent bg-bg text-faint opacity-50",
                    ].join(" ")}
                  >
                    <div class="flex justify-between font-mono text-[10px]">
                      <span class="font-semibold text-accent">{row.id}</span>
                      <span>n={row.respondents}</span>
                    </div>
                    <div class="mt-0.5 truncate text-xs font-medium">{row.name}</div>
                    <div class="mt-1 font-mono text-[11px] tabular-nums text-muted">
                      {row.facilityScore.toFixed(2)}%
                    </div>
                  </button>
                );
              }}
            </For>
          </div>
        </div>

        {/* Architectural Decisions Ledger */}
        <div class="rounded-2xl border border-border bg-bg-panel p-5">
          <div class="font-mono text-[10px] tracking-[0.1em] text-faint uppercase">
            ARCHITECTURE CALLS &amp; HARD PROOF
          </div>
          <h2 class="m-0 mt-0.5 mb-3 text-base font-bold text-fg">Six High-Leverage Decisions</h2>
          <div class="space-y-2">
            <For each={[...ARCHITECTURE_PROOFS]}>
              {(proof) => (
                <div class="rounded-lg border border-border bg-bg-deep p-2.5">
                  <div class="flex items-center justify-between gap-2">
                    <span class="text-xs font-semibold text-fg">{proof.title}</span>
                    <span class="shrink-0 rounded bg-bg-panel px-2 py-0.5 font-mono text-[10px] text-accent">
                      {proof.metricBadge}
                    </span>
                  </div>
                  <p class="m-0 mt-1 text-[11.5px] leading-snug text-muted">{proof.outcome}</p>
                </div>
              )}
            </For>
          </div>
        </div>
      </section>

      {/* Visual Dossiers & Live Public Storefronts Grid */}
      <section class="rounded-2xl border border-border bg-bg-panel p-5">
        <div class="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <div class="font-mono text-[10px] tracking-[0.1em] text-accent uppercase">
              SHIPPED SYSTEMS &amp; PUBLIC STOREFRONTS (10)
            </div>
            <h2 class="m-0 mt-0.5 text-base font-bold text-fg">
              Click Any System to Inspect Screenshots &amp; Architecture Dossier
            </h2>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          <For each={[...ALL_ENRICHED_WORK]}>
            {(item) => (
              <div class="group flex flex-col justify-between overflow-hidden rounded-xl border border-border bg-bg-deep transition-colors hover:border-accent/50">
                <div>
                  <Show when={item.thumbSrc}>
                    {(src) => (
                      <button
                        type="button"
                        onClick={() => props.onInspectCase(item)}
                        class="block h-36 w-full overflow-hidden border-b border-border bg-bg p-0 text-left"
                      >
                        <img
                          src={src()}
                          alt={item.title}
                          loading="lazy"
                          class="size-full object-cover object-left-top transition-transform duration-200 group-hover:scale-[1.02]"
                        />
                      </button>
                    )}
                  </Show>
                  <div class="p-3.5">
                    <div class="flex items-center justify-between gap-2 font-mono text-[10px] text-faint uppercase">
                      <span>{item.folderTitle}</span>
                      <span class={item.live ? "text-ok" : "text-faint"}>
                        {item.live ? "LIVE APP" : item.badge}
                      </span>
                    </div>
                    <h3 class="m-0 mt-1 text-sm font-bold text-fg">{item.title}</h3>
                    <p class="m-0 mt-1 text-xs leading-relaxed text-muted">{item.lede}</p>
                  </div>
                </div>

                <div class="flex items-center justify-between gap-2 border-t border-border bg-bg-panel px-3.5 py-2.5">
                  <button
                    type="button"
                    onClick={() => props.onInspectCase(item)}
                    class="font-mono text-[11px] font-semibold text-accent hover:underline"
                  >
                    Inspect Shots ({item.allMedia.length}) →
                  </button>
                  <Show when={item.live}>
                    {(liveUrl) => (
                      <a
                        href={liveUrl()}
                        target="_blank"
                        rel="noreferrer"
                        class="rounded bg-accent-soft px-2 py-0.5 font-mono text-[10.5px] font-medium text-accent no-underline hover:bg-accent/20"
                      >
                        Open Live ↗
                      </a>
                    )}
                  </Show>
                </div>
              </div>
            )}
          </For>
        </div>
      </section>
    </div>
  );
};

/* ============================================================================
 * CANVAS VARIANT 02 · THE ENGINEERING MONOGRAPH (EDITORIAL BROADSHEET)
 * Inspired by Stripe Press / The Pudding / technical field monographs.
 * ========================================================================== */
const FullCanvasMonograph: Component<{
  onInspectCase: (item: EnrichedWorkItem) => void;
  onOpenResume: () => void;
}> = (props) => {
  return (
    <div class="mx-auto max-w-5xl px-4 py-8 sm:px-8">
      {/* Newspaper / Monograph Masthead */}
      <header class="border-y-2 border-fg py-4">
        <div class="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2 font-mono text-[10px] tracking-[0.14em] text-faint uppercase">
          <span>VOL. XIII · NO. 144 · PUNJAB, INDIA (REMOTE)</span>
          <span>THE ENGINEERING MONOGRAPH · VISHALK.COM</span>
          <span>13+ YEARS SOFTWARE · 7+ YEARS REACT / NEXT.JS</span>
        </div>

        <div class="my-5 text-center">
          <h1 class="m-0 font-serif text-4xl font-bold tracking-[-0.03em] text-fg sm:text-6xl">
            VISHAL KUMAR
          </h1>
          <p class="mx-auto mt-2 max-w-2xl font-mono text-xs tracking-[0.06em] text-accent uppercase">
            Senior Frontend Engineer · Reporting &amp; BI Surfaces · High-State Admin Forms ·
            Platform Velocity
          </p>
        </div>

        <div class="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-2.5 font-mono text-xs">
          <span class="text-muted">
            Evidence-first product engineering; AI-native workflow; every line tested &amp; owned.
          </span>
          <div class="flex items-center gap-3">
            <button
              type="button"
              onClick={() => props.onOpenResume()}
              class="font-semibold text-accent hover:underline"
            >
              [Curriculum Vitae PDF]
            </button>
            <a href={`mailto:${CONTACT_EMAIL}`} class="text-fg no-underline hover:underline">
              [{CONTACT_EMAIL}]
            </a>
            <a
              href="https://github.com/vishalkdotcom"
              target="_blank"
              rel="noreferrer"
              class="text-muted no-underline hover:text-fg"
            >
              [GitHub ↗]
            </a>
          </div>
        </div>
      </header>

      {/* Three Broadsheet Column Dispatches */}
      <section class="mt-8 grid grid-cols-1 gap-6 border-b border-border pb-8 lg:grid-cols-3">
        <article class="border-b border-border pb-5 lg:border-r lg:border-b-0 lg:pr-6 lg:pb-0">
          <div class="font-mono text-[10px] tracking-[0.12em] text-accent uppercase">
            DISPATCH 01 · DATA AUTHORITY
          </div>
          <h2 class="m-0 mt-1.5 font-serif text-xl font-bold text-fg">
            When Two Dashboards Disagree by 0.59 Points, Neither Is Trusted
          </h2>
          <p class="m-0 mt-2.5 text-[13px] leading-[1.65] text-muted">
            At Labor Solutions, customer survey dashboards in Metabase (Trino SQL) and exported
            Excel workbooks (Django/Pandas) produced subtly different scores. Instead of fudging
            rounding, I authored a counterexample harness proving that averaging facility means (
            <code class="font-mono text-fg">71.40</code> on 2 sites;{" "}
            <code class="font-mono text-fg">54.31</code> on 8) diverges from respondent-level
            question averages (<code class="font-mono text-ok">71.47</code> /{" "}
            <code class="font-mono text-ok">54.90</code>) whenever headcount varies.
          </p>
          <p class="m-0 mt-2.5 text-[13px] leading-[1.65] text-fg">
            <strong>The Fix:</strong> Analytics cards became the single scoring authority; Django
            became a thin validation and pivot-table projection layer.
          </p>
        </article>

        <article class="border-b border-border pb-5 lg:border-r lg:border-b-0 lg:pr-6 lg:pb-0">
          <div class="font-mono text-[10px] tracking-[0.12em] text-accent uppercase">
            DISPATCH 02 · THE CONFIDENT “NO”
          </div>
          <h2 class="m-0 mt-1.5 font-serif text-xl font-bold text-fg">
            Disproving Bad Migrations in Isolated Production Worktrees
          </h2>
          <p class="m-0 mt-2.5 text-[13px] leading-[1.65] text-muted">
            Senior leverage includes preventing expensive churn. When a “lighter” rich-text editor
            was pitched, I built an isolated Next.js production worktree and measured the lazy
            chunk: the candidate weighed <code class="font-mono text-warn">350 KiB gzip</code> (10.1
            MiB install) vs. our existing{" "}
            <code class="font-mono text-ok">MDXEditor at 164 KiB gzip</code> (1.8 MiB install).
          </p>
          <p class="m-0 mt-2.5 text-[13px] leading-[1.65] text-fg">
            <strong>Context Over Dogma:</strong> Kept Redux Toolkit on Next.js App Router SSR
            (WPM-2255, saving 7–13h of churn), while migrating Jotai → Zustand on our client-only
            React Native app (WPM-3132).
          </p>
        </article>

        <article>
          <div class="font-mono text-[10px] tracking-[0.12em] text-accent uppercase">
            DISPATCH 03 · MEASURED VELOCITY
          </div>
          <h2 class="m-0 mt-1.5 font-serif text-xl font-bold text-fg">
            Halving Production Build Time (84.5s → 40.6s) by Hunting Bottlenecks
          </h2>
          <p class="m-0 mt-2.5 text-[13px] leading-[1.65] text-muted">
            Over 36% of my shipped engineering tickets (61 of 168) were proactive improvements
            spotted while working in adjacent product surfaces. I scoped a 3-ticket cluster:
            upgrading to Next.js 16 (WPM-3019), eliminating barrel files (WPM-3029), and caching CI
            lint/build pipelines (WPM-3104).
          </p>
          <p class="m-0 mt-2.5 text-[13px] leading-[1.65] text-fg">
            <strong>Benchmark Proof:</strong> Verified via <code class="font-mono">hyperfine</code>{" "}
            on a quiet machine: production builds dropped from{" "}
            <code class="font-mono text-warn">84.5s ± 11.4s</code> to{" "}
            <code class="font-mono text-ok">40.6s ± 3.2s</code> (
            <code class="font-mono">2.08×</code> faster).
          </p>
        </article>
      </section>

      {/* Annotated Plate Index of Works */}
      <section class="mt-8">
        <div class="mb-4 flex items-baseline justify-between">
          <h2 class="m-0 font-serif text-2xl font-bold text-fg">
            Illustrated Index of Shipped Works &amp; Live Storefronts
          </h2>
          <span class="font-mono text-xs text-faint">PLATES I – X</span>
        </div>

        <div class="divide-y divide-border border-y border-border">
          <For each={[...ALL_ENRICHED_WORK]}>
            {(item, index) => (
              <div class="grid grid-cols-1 items-center gap-4 py-4 md:grid-cols-[90px_1.2fr_1.6fr_auto]">
                <div class="font-mono text-xs text-faint">
                  PLATE {String(index() + 1).padStart(2, "0")}
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => props.onInspectCase(item)}
                    class="text-left font-serif text-lg font-bold text-fg hover:text-accent"
                  >
                    {item.title}
                  </button>
                  <div class="font-mono text-[11px] text-muted">
                    {item.folderTitle} · {item.badge}
                  </div>
                </div>
                <p class="m-0 text-xs leading-relaxed text-muted">{item.outcomes[0]?.text}</p>
                <div class="flex items-center gap-2">
                  <Show when={item.live}>
                    {(liveUrl) => (
                      <a
                        href={liveUrl()}
                        target="_blank"
                        rel="noreferrer"
                        class="rounded border border-accent/40 bg-accent-soft px-2.5 py-1 font-mono text-[11px] font-medium text-accent no-underline hover:bg-accent/20"
                      >
                        Live ↗
                      </a>
                    )}
                  </Show>
                  <button
                    type="button"
                    onClick={() => props.onInspectCase(item)}
                    class="rounded border border-border bg-bg-panel px-2.5 py-1 font-mono text-[11px] text-fg hover:bg-bg-hover"
                  >
                    Inspect Plate →
                  </button>
                </div>
              </div>
            )}
          </For>
        </div>
      </section>
    </div>
  );
};

/* ============================================================================
 * CANVAS VARIANT 03 · THE COMMAND DECK & PR GATEKEEPER
 * Keyboard-first engineering workbench, PR #155 6-defect review inspector,
 * live filterable command palette, and open-source launcher.
 * ========================================================================== */
const FullCanvasCommandDeck: Component<{
  onInspectCase: (item: EnrichedWorkItem) => void;
  onOpenResume: () => void;
}> = (props) => {
  const [query, setQuery] = createSignal("");
  const [selectedDefect, setSelectedDefect] = createSignal(PR_155_DEFECTS[0]!);
  const [activeTab, setActiveTab] = createSignal<"systems" | "defects" | "proofs">("systems");

  const filteredWork = () => {
    const q = query().trim().toLowerCase();
    if (!q) return ALL_ENRICHED_WORK;
    return ALL_ENRICHED_WORK.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.folderTitle.toLowerCase().includes(q) ||
        item.lede.toLowerCase().includes(q) ||
        item.stack.some((s) => s.toLowerCase().includes(q)),
    );
  };

  return (
    <div class="mx-auto max-w-6xl space-y-5 px-4 py-6 font-mono sm:px-8">
      {/* Terminal Top Bar */}
      <div class="overflow-hidden rounded-xl border border-border bg-bg-deep shadow-lg">
        <div class="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-bg-panel px-4 py-2.5 text-xs">
          <div class="flex items-center gap-2">
            <span class="size-2.5 rounded-full bg-warn" />
            <span class="size-2.5 rounded-full bg-accent" />
            <span class="size-2.5 rounded-full bg-ok" />
            <span class="ml-2 font-semibold text-fg">
              pwsh 7.5 · chezmoi · vk@workstation:~/command-deck
            </span>
          </div>
          <div class="flex items-center gap-3 text-[11px] text-muted">
            <span>124 PRs (FY25-26)</span>
            <span>·</span>
            <span>6 OKRs PIC</span>
            <span>·</span>
            <button
              type="button"
              onClick={() => props.onOpenResume()}
              class="text-accent hover:underline"
            >
              open vishal-cv.pdf
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-4 p-5 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <div class="text-xs text-ok">$ vk whoami --format=concise</div>
            <h1 class="m-0 mt-1 font-sans text-2xl font-bold text-fg sm:text-3xl">
              {ABOUT_NAME} — Senior Frontend Engineer
            </h1>
            <p class="m-0 mt-1.5 font-sans text-xs leading-relaxed text-muted">{ABOUT_PITCH}</p>
            <div class="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("systems")}
                class={[
                  "rounded-md border px-3 py-1.5 text-xs transition-colors",
                  activeTab() === "systems"
                    ? "border-accent bg-accent/16 font-semibold text-accent"
                    : "border-border bg-bg-panel text-muted hover:text-fg",
                ].join(" ")}
              >
                01 · Shipped Systems ({ALL_ENRICHED_WORK.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("defects")}
                class={[
                  "rounded-md border px-3 py-1.5 text-xs transition-colors",
                  activeTab() === "defects"
                    ? "border-accent bg-accent/16 font-semibold text-accent"
                    : "border-border bg-bg-panel text-muted hover:text-fg",
                ].join(" ")}
              >
                02 · PR #155 Gatekeeper (6 Catches)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("proofs")}
                class={[
                  "rounded-md border px-3 py-1.5 text-xs transition-colors",
                  activeTab() === "proofs"
                    ? "border-accent bg-accent/16 font-semibold text-accent"
                    : "border-border bg-bg-panel text-muted hover:text-fg",
                ].join(" ")}
              >
                03 · Benchmark Ledger (6)
              </button>
            </div>
          </div>

          {/* Command Filter Input */}
          <div class="flex flex-col justify-between rounded-xl border border-border bg-bg-panel p-3.5">
            <div>
              <label
                for="deck-command-input"
                class="block text-[10px] tracking-[0.08em] text-faint uppercase"
              >
                Filter Systems by Stack, Org, or Keyword
              </label>
              <input
                id="deck-command-input"
                type="search"
                value={query()}
                onInput={(e) => setQuery(e.currentTarget.value)}
                placeholder="Try: Next.js 16, Trino, Snowflake, Gemini, PDF..."
                class="mt-1.5 w-full rounded-md border border-border bg-bg-deep px-3 py-2 text-xs text-fg outline-none focus:border-accent"
              />
            </div>
            <div class="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-faint">
              <span>Matches: {filteredWork().length} / 10</span>
              <a href={`mailto:${CONTACT_EMAIL}`} class="text-accent no-underline hover:underline">
                {CONTACT_EMAIL}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <Switch>
        <Match when={activeTab() === "systems"}>
          <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
            <For each={filteredWork()}>
              {(item) => (
                <div class="flex flex-col justify-between rounded-xl border border-border bg-bg-panel p-4">
                  <div>
                    <div class="flex items-center justify-between gap-2 text-[10px] text-faint">
                      <span class="text-accent uppercase">{item.folderTitle}</span>
                      <span>{item.role}</span>
                    </div>
                    <div class="mt-1 flex items-center justify-between gap-2">
                      <h3 class="m-0 font-sans text-base font-bold text-fg">{item.title}</h3>
                      <Show when={item.live}>
                        {(liveUrl) => (
                          <a
                            href={liveUrl()}
                            target="_blank"
                            rel="noreferrer"
                            class="rounded bg-ok/15 px-2 py-0.5 text-[10px] font-semibold text-ok no-underline hover:bg-ok/25"
                          >
                            LAUNCH LIVE ↗
                          </a>
                        )}
                      </Show>
                    </div>
                    <p class="m-0 mt-1.5 font-sans text-xs leading-relaxed text-muted">
                      {item.outcomes[0]?.text}
                    </p>
                  </div>

                  <div class="mt-3 flex items-center justify-between gap-2 border-t border-border pt-2.5">
                    <div class="flex flex-wrap gap-1">
                      <For each={item.stack.slice(0, 4)}>
                        {(s) => (
                          <span class="rounded bg-bg-deep px-1.5 py-0.5 text-[10px] text-muted">
                            {s}
                          </span>
                        )}
                      </For>
                    </div>
                    <button
                      type="button"
                      onClick={() => props.onInspectCase(item)}
                      class="text-[11px] font-semibold text-accent hover:underline"
                    >
                      inspect({item.allMedia.length}) →
                    </button>
                  </div>
                </div>
              )}
            </For>
          </div>
        </Match>

        <Match when={activeTab() === "defects"}>
          <div class="grid grid-cols-1 gap-4 rounded-xl border border-border bg-bg-panel p-5 lg:grid-cols-[260px_1fr]">
            <div class="space-y-1.5">
              <div class="mb-2 text-[10px] text-faint uppercase">PR #155 · 6 Defects Caught</div>
              <For each={[...PR_155_DEFECTS]}>
                {(d) => (
                  <button
                    type="button"
                    onClick={() => setSelectedDefect(d)}
                    class={[
                      "flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-xs",
                      selectedDefect().id === d.id
                        ? "border-accent bg-accent/14 text-fg"
                        : "border-border bg-bg-deep text-muted hover:text-fg",
                    ].join(" ")}
                  >
                    <span class="font-bold text-accent">{d.id}</span>
                    <span class="text-[10px] text-warn">{d.severity}</span>
                  </button>
                )}
              </For>
            </div>

            <div class="rounded-xl border border-border bg-bg-deep p-4 font-sans">
              <div class="font-mono text-xs font-bold text-accent">
                {selectedDefect().id} · {selectedDefect().location}
              </div>
              <div class="mt-3 space-y-3 text-xs">
                <div>
                  <div class="font-mono text-[10px] text-warn uppercase">
                    User-Facing Symptom Prevented
                  </div>
                  <p class="m-0 mt-1 text-sm text-fg">{selectedDefect().symptom}</p>
                </div>
                <div>
                  <div class="font-mono text-[10px] text-accent uppercase">Root Cause in Diff</div>
                  <p class="m-0 mt-1 text-muted">{selectedDefect().rootCause}</p>
                </div>
                <div>
                  <div class="font-mono text-[10px] text-ok uppercase">Verification &amp; Fix</div>
                  <p class="m-0 mt-1 text-fg">{selectedDefect().fix}</p>
                </div>
              </div>
            </div>
          </div>
        </Match>

        <Match when={activeTab() === "proofs"}>
          <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
            <For each={[...ARCHITECTURE_PROOFS]}>
              {(p) => (
                <div class="rounded-xl border border-border bg-bg-panel p-4 font-sans">
                  <div class="flex items-center justify-between font-mono text-[10px]">
                    <span class="text-accent">{p.code}</span>
                    <span class="rounded bg-bg-deep px-2 py-0.5 text-ok">{p.metricBadge}</span>
                  </div>
                  <h3 class="m-0 mt-1 text-sm font-bold text-fg">{p.title}</h3>
                  <p class="m-0 mt-1.5 text-xs leading-relaxed text-muted">{p.decision}</p>
                </div>
              )}
            </For>
          </div>
        </Match>
      </Switch>

      {/* Open-Source Desktop, Mobile & Workstation Row */}
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <For each={[...OPEN_SOURCE_EXTRAS]}>
          {(extra) => (
            <a
              href={extra.href}
              target="_blank"
              rel="noreferrer"
              class="rounded-xl border border-border bg-bg-panel p-3.5 no-underline hover:border-accent/50"
            >
              <div class="flex justify-between text-[10px] text-accent">
                <span>{extra.tag}</span>
                <span>gh ↗</span>
              </div>
              <div class="mt-1 font-sans text-sm font-bold text-fg">{extra.title}</div>
              <p class="m-0 mt-1 font-sans text-xs text-muted">{extra.blurb}</p>
            </a>
          )}
        </For>
      </div>
    </div>
  );
};

/* ============================================================================
 * CANVAS VARIANT 04 · TEN-SECOND SIGNAL INDEX (SWISS ULTRA-MINIMAL)
 * Fits on a single desktop screen with zero fluff, instant hover preview plate,
 * and 1-click actions.
 * ========================================================================== */
const FullCanvasSignalIndex: Component<{
  onInspectCase: (item: EnrichedWorkItem) => void;
  onOpenResume: () => void;
}> = (props) => {
  const [hovered, setHovered] = createSignal<EnrichedWorkItem>(ALL_ENRICHED_WORK[0]!);
  const [copied, setCopied] = createSignal(false);

  const copyMail = () => {
    navigator.clipboard?.writeText(CONTACT_EMAIL).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div class="mx-auto max-w-6xl px-4 py-6 sm:px-8">
      {/* Compact Header Row */}
      <div class="flex flex-wrap items-baseline justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 class="m-0 text-2xl font-bold tracking-[-0.03em] text-fg">
            {ABOUT_NAME}
            <span class="ml-2.5 font-mono text-xs font-normal text-muted">
              Senior Frontend Engineer · React / Next.js · {BASED_LOCATION}
            </span>
          </h1>
        </div>
        <div class="flex items-center gap-2 font-mono text-xs">
          <button
            type="button"
            onClick={copyMail}
            class="rounded-md border border-border bg-bg-panel px-2.5 py-1 text-fg hover:bg-bg-hover"
          >
            {copied() ? "Copied hello@vishalk.com ✓" : CONTACT_EMAIL}
          </button>
          <button
            type="button"
            onClick={() => props.onOpenResume()}
            class="rounded-md bg-accent/15 px-2.5 py-1 font-semibold text-accent hover:bg-accent/25"
          >
            Resume PDF
          </button>
          <a
            href="https://github.com/vishalkdotcom"
            target="_blank"
            rel="noreferrer"
            class="rounded-md border border-border bg-bg-panel px-2.5 py-1 text-muted no-underline hover:text-fg"
          >
            GitHub ↗
          </a>
        </div>
      </div>

      {/* Main Two-Column Index + Live Preview */}
      <div class="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-[1.45fr_1fr]">
        <div>
          <div class="mb-2 font-mono text-[10px] tracking-[0.12em] text-faint uppercase">
            01 · Verified Production &amp; Prototype Index (Hover to Preview · Click for Dossier)
          </div>
          <div class="divide-y divide-border rounded-xl border border-border bg-bg-panel">
            <For each={[...ALL_ENRICHED_WORK]}>
              {(item, i) => (
                <div
                  onMouseEnter={() => setHovered(item)}
                  class={[
                    "flex items-center justify-between gap-3 px-3.5 py-2.5 transition-colors",
                    hovered().slug === item.slug ? "bg-bg-hover" : "",
                  ].join(" ")}
                >
                  <button
                    type="button"
                    onClick={() => props.onInspectCase(item)}
                    class="flex min-w-0 flex-1 items-center gap-3 text-left"
                  >
                    <span class="font-mono text-[11px] text-faint">
                      {String(i() + 1).padStart(2, "0")}
                    </span>
                    <span class="shrink-0 text-xs font-bold text-fg">{item.title}</span>
                    <span class="truncate text-xs text-muted">{item.lede}</span>
                  </button>
                  <div class="flex shrink-0 items-center gap-2 font-mono text-[10px]">
                    <Show when={item.live}>
                      {(url) => (
                        <a
                          href={url()}
                          target="_blank"
                          rel="noreferrer"
                          class="rounded bg-accent-soft px-1.5 py-0.5 text-accent no-underline"
                        >
                          live↗
                        </a>
                      )}
                    </Show>
                    <span class="text-faint">{item.folderTitle}</span>
                  </div>
                </div>
              )}
            </For>
          </div>

          {/* 4-Item Benchmark Strip */}
          <div class="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            <div class="rounded-lg border border-border bg-bg-panel p-2.5">
              <div class="font-mono text-xs font-bold text-ok">84.5s → 40.6s</div>
              <div class="text-[11px] text-muted">Next.js 16 build (2.08×)</div>
            </div>
            <div class="rounded-lg border border-border bg-bg-panel p-2.5">
              <div class="font-mono text-xs font-bold text-accent">71.47 vs 71.40</div>
              <div class="text-[11px] text-muted">Score parity proof</div>
            </div>
            <div class="rounded-lg border border-border bg-bg-panel p-2.5">
              <div class="font-mono text-xs font-bold text-fg">164 vs 350 KiB</div>
              <div class="text-[11px] text-muted">Editor gzip bake-off</div>
            </div>
            <div class="rounded-lg border border-border bg-bg-panel p-2.5">
              <div class="font-mono text-xs font-bold text-warn">45/45 Green</div>
              <div class="text-[11px] text-muted">PK&gt;=10 backfill guard</div>
            </div>
          </div>
        </div>

        {/* Sticky Preview Plate */}
        <div class="flex flex-col justify-between rounded-2xl border border-border bg-bg-panel p-4">
          <div>
            <div class="flex items-center justify-between font-mono text-[10px] text-accent uppercase">
              <span>{hovered().folderTitle}</span>
              <span>{hovered().role}</span>
            </div>
            <h2 class="m-0 mt-1 text-lg font-bold text-fg">{hovered().title}</h2>
            <p class="m-0 mt-1 text-xs leading-relaxed text-muted">{hovered().outcomes[0]?.text}</p>

            <Show when={hovered().thumbSrc}>
              {(src) => (
                <button
                  type="button"
                  onClick={() => props.onInspectCase(hovered())}
                  class="mt-3 block h-48 w-full overflow-hidden rounded-xl border border-border bg-bg-deep p-0"
                >
                  <img
                    src={src()}
                    alt={hovered().title}
                    class="size-full object-cover object-left-top"
                  />
                </button>
              )}
            </Show>
          </div>

          <div class="mt-4 flex items-center justify-between border-t border-border pt-3">
            <div class="flex flex-wrap gap-1">
              <For each={hovered().stack.slice(0, 4)}>
                {(s) => (
                  <span class="rounded bg-bg-deep px-2 py-0.5 font-mono text-[10px] text-muted">
                    {s}
                  </span>
                )}
              </For>
            </div>
            <button
              type="button"
              onClick={() => props.onInspectCase(hovered())}
              class="font-mono text-xs font-semibold text-accent hover:underline"
            >
              Full Dossier →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
 * FLOATING EMIL-STYLE VARIANT SWITCHER + FULL-CANVAS OVERLAY HOST
 * Allows visitors to either browse inside the Triptych App Shell OR launch
 * any of the 4 full-bleed standalone creative variants.
 * ========================================================================== */
export const FullCanvasVariantHost: Component = () => {
  const { variant, setVariant } = useSiteVariant();
  const [fullBleed, setFullBleed] = createSignal<boolean>(
    typeof window !== "undefined" && new URLSearchParams(window.location.search).has("v"),
  );
  const [inspectedCase, setInspectedCase] = createSignal<EnrichedWorkItem | null>(null);
  const [resumeOpen, setResumeOpen] = createSignal(false);

  onSettled(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (inspectedCase()) {
          setInspectedCase(null);
          return;
        }
        if (resumeOpen()) {
          setResumeOpen(false);
          return;
        }
      }
      if (!event.altKey || event.ctrlKey || event.metaKey) return;
      const map: Record<string, SiteVariantId> = {
        "1": "ledger",
        "2": "monograph",
        "3": "command",
        "4": "signal",
      };
      if (map[event.key]) {
        event.preventDefault();
        setVariant(map[event.key]!);
        setFullBleed(true);
      } else if (event.key === "0") {
        event.preventDefault();
        setFullBleed(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  const chooseCanvasVariant = (id: SiteVariantId) => {
    setVariant(id, true);
    setFullBleed(true);
  };

  return (
    <>
      {/* Full-Bleed Standalone Variant Overlay when active */}
      <Show when={fullBleed()}>
        <div
          class="vk-scroll fixed inset-0 z-40 overflow-y-auto bg-bg text-fg"
          data-full-canvas-variant={variant()}
        >
          {/* Top Bar inside Full-Bleed Creative Variant */}
          <div class="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-2 border-b border-border bg-bg-deep/95 px-4 py-2 backdrop-blur-xs sm:px-8">
            <div class="flex items-center gap-2.5">
              <span class="grid size-6 place-items-center rounded-full bg-accent/15 font-mono text-[10px] font-bold text-accent">
                VK
              </span>
              <span class="font-mono text-xs font-semibold text-fg">vishalk.com</span>
              <span class="hidden font-mono text-[11px] text-faint sm:inline">
                · Creative Edition {SITE_VARIANTS.find((v) => v.id === variant())?.num} (
                {SITE_VARIANTS.find((v) => v.id === variant())?.title})
              </span>
            </div>

            <div class="flex items-center gap-1.5">
              <For each={[...SITE_VARIANTS]}>
                {(v) => (
                  <button
                    type="button"
                    onClick={() => chooseCanvasVariant(v.id)}
                    aria-pressed={variant() === v.id ? "true" : "false"}
                    class={[
                      "rounded-md px-2.5 py-1 font-mono text-[11px] transition-colors",
                      variant() === v.id
                        ? "bg-accent text-white font-semibold"
                        : "bg-bg-panel text-muted hover:bg-bg-hover hover:text-fg",
                    ].join(" ")}
                  >
                    {v.num} {v.shortLabel}
                  </button>
                )}
              </For>
              <button
                type="button"
                onClick={() => {
                  setFullBleed(false);
                  if (typeof window !== "undefined") {
                    try {
                      const url = new URL(window.location.href);
                      url.searchParams.delete("v");
                      window.history.replaceState(window.history.state, "", url.toString());
                    } catch {
                      // ignore
                    }
                  }
                }}
                class="ml-1 rounded-md border border-border bg-bg-panel px-2.5 py-1 font-mono text-[11px] text-muted hover:bg-bg-hover hover:text-fg"
                title="Return to Triptych Workbench view"
              >
                Triptych Shell ✕
              </button>
              <ThemeControl />
            </div>
          </div>

          <Switch>
            <Match when={variant() === "ledger"}>
              <FullCanvasLedger
                onInspectCase={(item) => setInspectedCase(item)}
                onOpenResume={() => setResumeOpen(true)}
              />
            </Match>
            <Match when={variant() === "monograph"}>
              <FullCanvasMonograph
                onInspectCase={(item) => setInspectedCase(item)}
                onOpenResume={() => setResumeOpen(true)}
              />
            </Match>
            <Match when={variant() === "command"}>
              <FullCanvasCommandDeck
                onInspectCase={(item) => setInspectedCase(item)}
                onOpenResume={() => setResumeOpen(true)}
              />
            </Match>
            <Match when={variant() === "signal"}>
              <FullCanvasSignalIndex
                onInspectCase={(item) => setInspectedCase(item)}
                onOpenResume={() => setResumeOpen(true)}
              />
            </Match>
          </Switch>
        </div>
      </Show>

      {/* Quick Case Modal */}
      <CaseQuickInspectorModal item={inspectedCase()} onClose={() => setInspectedCase(null)} />

      {/* Quick Resume PDF Modal */}
      <Show when={resumeOpen()}>
        <div
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Resume PDF Preview"
          onClick={(e) => {
            if (e.target === e.currentTarget) setResumeOpen(false);
          }}
        >
          <div class="flex h-[88vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-border bg-bg-panel">
            <div class="flex items-center justify-between border-b border-border bg-bg-deep px-4 py-2.5">
              <span class="font-mono text-xs font-semibold text-fg">vishal-cv.pdf</span>
              <div class="flex items-center gap-2">
                <a
                  href={RESUME_PDF_HREF}
                  download
                  class="rounded bg-accent px-2.5 py-1 font-mono text-xs text-white no-underline"
                >
                  Download PDF
                </a>
                <button
                  type="button"
                  onClick={() => setResumeOpen(false)}
                  class="rounded border border-border bg-bg px-2.5 py-1 font-mono text-xs text-muted hover:text-fg"
                >
                  Close ✕
                </button>
              </div>
            </div>
            <iframe
              src={RESUME_PDF_HREF}
              title={RESUME_PDF_TITLE}
              class="h-full w-full flex-1 border-0"
            />
          </div>
        </div>
      </Show>

      {/* Subtle Floating Bottom-Right Full-Canvas Edition Pill when in Triptych Shell */}
      <Show when={!fullBleed()}>
        <div
          class="fixed right-4 bottom-3 z-20 hidden items-center gap-1 rounded-full border border-border bg-bg-deep/95 px-2.5 py-1 shadow-lg backdrop-blur-xs md:inline-flex"
          role="group"
          aria-label="Full-bleed creative editions"
        >
          <span class="px-1.5 font-mono text-[10px] tracking-[0.06em] text-faint uppercase">
            Full-Canvas Editions:
          </span>
          <For each={[...SITE_VARIANTS]}>
            {(v) => (
              <button
                type="button"
                onClick={() => chooseCanvasVariant(v.id)}
                class="rounded-full px-2 py-0.5 font-mono text-[10.5px] text-muted hover:bg-accent/16 hover:text-accent"
                title={`Launch full-bleed ${v.title} (?v=${v.id})`}
              >
                {v.num}·{v.shortLabel}
              </button>
            )}
          </For>
        </div>
      </Show>
    </>
  );
};
