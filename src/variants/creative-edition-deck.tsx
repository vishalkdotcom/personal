import { A } from "@solidjs/router";
import { For, Match, Show, Switch, createSignal, type Component } from "solid-js";
import { CONTACT_EMAIL } from "../contact/content";
import { RESUME_PDF_HREF } from "../resume/content";
import {
  ALL_ENRICHED_WORK,
  ARCHITECTURE_PROOFS,
  FACILITY_PARITY_SAMPLES,
  OPEN_SOURCE_EXTRAS,
  PR_155_DEFECTS,
  SITE_VARIANTS,
  useSiteVariant,
  type EnrichedWorkItem,
} from "./variant-store";

/* ============================================================================
 * VARIANT 01 · PROOF LEDGER & COUNTEREXAMPLE LAB
 * Swiss precision ledger with interactive 8-facility scoring parity simulator,
 * hyperfine build & gzip bundle bars, and expandable architecture proofs.
 * ========================================================================== */
const ProofLedgerModule: Component = () => {
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
  const [expandedProof, setExpandedProof] = createSignal<string>("scoring-authority");

  const activeRows = () =>
    FACILITY_PARITY_SAMPLES.filter((row) => selectedFacilities()[row.id] !== false);

  const metrics = () => {
    const rows = activeRows();
    if (rows.length === 0) {
      return {
        totalRespondents: 0,
        questionFirst: 0,
        facilityFirst: 0,
        drift: 0,
      };
    }
    const totalRespondents = rows.reduce((sum, r) => sum + r.respondents, 0);
    const totalFavorable = rows.reduce((sum, r) => sum + r.favorableCount, 0);
    const questionFirst = (totalFavorable / totalRespondents) * 100;
    const facilityFirst = rows.reduce((sum, r) => sum + r.facilityScore, 0) / rows.length;
    const drift = questionFirst - facilityFirst;
    return {
      totalRespondents,
      questionFirst,
      facilityFirst,
      drift,
    };
  };

  const toggleFacility = (id: string) => {
    setSelectedFacilities((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      const anyActive = Object.values(next).some(Boolean);
      if (!anyActive) return prev;
      return next;
    });
  };

  const selectPreset = (mode: "all8" | "pair2" | "skewed3") => {
    if (mode === "all8") {
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
    } else if (mode === "pair2") {
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
    <div class="space-y-5" data-variant-surface="ledger">
      {/* Interactive Counterexample Simulator */}
      <div class="rounded-xl border border-border bg-bg-deep p-4">
        <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <div class="font-mono text-[10px] tracking-[0.1em] text-accent uppercase">
              01 · Interactive Counterexample Harness
            </div>
            <h3 class="m-0 mt-0.5 text-sm font-semibold text-fg">
              Why Dashboard (Question-First) &amp; Excel (Facility-First) Scores Diverged
            </h3>
          </div>
          <div class="flex items-center gap-1">
            <button
              type="button"
              onClick={() => selectPreset("all8")}
              class="rounded border border-border bg-bg-panel px-2 py-1 font-mono text-[10px] text-muted hover:bg-bg-hover hover:text-fg"
            >
              8-Site Slice
            </button>
            <button
              type="button"
              onClick={() => selectPreset("pair2")}
              class="rounded border border-border bg-bg-panel px-2 py-1 font-mono text-[10px] text-muted hover:bg-bg-hover hover:text-fg"
            >
              2-Site Extreme
            </button>
            <button
              type="button"
              onClick={() => selectPreset("skewed3")}
              class="rounded border border-border bg-bg-panel px-2 py-1 font-mono text-[10px] text-muted hover:bg-bg-hover hover:text-fg"
            >
              3-Site Skew
            </button>
          </div>
        </div>

        {/* Live Telemetry Readout Cards */}
        <div class="mb-3.5 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
          <div class="rounded-lg border border-ok/30 bg-bg-panel p-3">
            <div class="font-mono text-[10px] text-ok uppercase">
              Trino Card Authority (Question-First)
            </div>
            <div class="mt-1 font-mono text-2xl font-bold tabular-nums text-fg">
              {metrics().questionFirst.toFixed(2)}%
            </div>
            <div class="mt-0.5 font-mono text-[11px] text-faint">
              Σ favorable / Σ respondents (N={metrics().totalRespondents})
            </div>
          </div>

          <div class="rounded-lg border border-warn/30 bg-bg-panel p-3">
            <div class="font-mono text-[10px] text-warn uppercase">
              Legacy Excel Export (Facility-First)
            </div>
            <div class="mt-1 font-mono text-2xl font-bold tabular-nums text-fg">
              {metrics().facilityFirst.toFixed(2)}%
            </div>
            <div class="mt-0.5 font-mono text-[11px] text-faint">
              Unweighted mean across {activeRows().length} facility averages
            </div>
          </div>

          <div class="rounded-lg border border-accent/30 bg-accent-soft p-3">
            <div class="font-mono text-[10px] text-accent uppercase">Measured Score Drift (Δ)</div>
            <div class="mt-1 font-mono text-2xl font-bold tabular-nums text-accent">
              {metrics().drift >= 0 ? "+" : ""}
              {metrics().drift.toFixed(2)} pts
            </div>
            <div class="mt-0.5 font-mono text-[11px] text-muted">
              Eliminated by routing Excel through card authority
            </div>
          </div>
        </div>

        {/* Interactive Facility Toggle Chips */}
        <div class="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
          <For each={[...FACILITY_PARITY_SAMPLES]}>
            {(row) => {
              const checked = () => selectedFacilities()[row.id] !== false;
              return (
                <button
                  type="button"
                  onClick={() => toggleFacility(row.id)}
                  aria-pressed={checked() ? "true" : "false"}
                  class={[
                    "flex flex-col items-start rounded-lg border p-2 text-left transition-colors",
                    checked()
                      ? "border-border bg-bg-panel text-fg"
                      : "border-transparent bg-bg text-faint opacity-55",
                  ].join(" ")}
                >
                  <div class="flex w-full items-center justify-between font-mono text-[10px]">
                    <span class="text-accent">{row.id}</span>
                    <span>n={row.respondents}</span>
                  </div>
                  <div class="mt-0.5 w-full truncate text-[11.5px] font-medium">{row.name}</div>
                  <div class="mt-1 font-mono text-[11px] tabular-nums text-muted">
                    {row.facilityScore.toFixed(2)}% fav
                  </div>
                </button>
              );
            }}
          </For>
        </div>
      </div>

      {/* Measured Build & Bundle Bar Telemetry */}
      <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div class="rounded-xl border border-border bg-bg-deep p-4">
          <div class="font-mono text-[10px] tracking-[0.1em] text-ok uppercase">
            02 · Hyperfine Build Benchmark
          </div>
          <div class="mt-0.5 text-sm font-semibold text-fg">
            Next.js 16 + De-Barrel + CI Cache Cluster
          </div>
          <div class="mt-3 space-y-2.5 font-mono text-xs">
            <div>
              <div class="mb-1 flex justify-between text-[11px] text-muted">
                <span>Before (Next 15 + barrels)</span>
                <span class="tabular-nums">84.5s ± 11.4s</span>
              </div>
              <div class="h-2.5 w-full overflow-hidden rounded-full bg-bg">
                <div class="h-full w-full rounded-full bg-warn/70" />
              </div>
            </div>
            <div>
              <div class="mb-1 flex justify-between text-[11px] text-fg">
                <span>After (3-ticket cluster)</span>
                <span class="font-semibold tabular-nums text-ok">40.6s ± 3.2s (2.08×)</span>
              </div>
              <div class="h-2.5 w-full overflow-hidden rounded-full bg-bg">
                <div class="h-full w-[48%] rounded-full bg-ok" />
              </div>
            </div>
          </div>
        </div>

        <div class="rounded-xl border border-border bg-bg-deep p-4">
          <div class="font-mono text-[10px] tracking-[0.1em] text-accent uppercase">
            03 · Production Worktree Bake-Off
          </div>
          <div class="mt-0.5 text-sm font-semibold text-fg">
            Rich-Text Editor Migration Rejected With Proof
          </div>
          <div class="mt-3 space-y-2.5 font-mono text-xs">
            <div>
              <div class="mb-1 flex justify-between text-[11px] text-muted">
                <span>Pitched Replacement (10.1 MiB install)</span>
                <span class="tabular-nums text-warn">350 KiB gzip</span>
              </div>
              <div class="h-2.5 w-full overflow-hidden rounded-full bg-bg">
                <div class="h-full w-full rounded-full bg-warn/70" />
              </div>
            </div>
            <div>
              <div class="mb-1 flex justify-between text-[11px] text-fg">
                <span>Kept MDXEditor (1.8 MiB install)</span>
                <span class="font-semibold tabular-nums text-accent">
                  164 KiB gzip (2.13× lighter)
                </span>
              </div>
              <div class="h-2.5 w-full overflow-hidden rounded-full bg-bg">
                <div class="h-full w-[47%] rounded-full bg-accent" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Expandable 6-Row Architectural Proof Ledger */}
      <div class="rounded-xl border border-border bg-bg-deep p-4">
        <div class="mb-2.5 flex items-center justify-between">
          <span class="font-mono text-[10px] tracking-[0.1em] text-faint uppercase">
            04 · Verified Engineering Decisions (Click to Inspect)
          </span>
          <span class="font-mono text-[10px] text-faint">6 Production Proofs</span>
        </div>
        <div class="divide-y divide-border rounded-lg border border-border bg-bg-panel">
          <For each={[...ARCHITECTURE_PROOFS]}>
            {(proof) => {
              const isOpen = () => expandedProof() === proof.id;
              return (
                <div>
                  <button
                    type="button"
                    onClick={() => setExpandedProof(isOpen() ? "" : proof.id)}
                    aria-expanded={isOpen() ? "true" : "false"}
                    class="flex w-full items-center justify-between gap-3 px-3.5 py-2.5 text-left hover:bg-bg-hover"
                  >
                    <div class="flex min-w-0 items-center gap-2.5">
                      <span class="shrink-0 font-mono text-[10px] text-accent">{proof.code}</span>
                      <span class="truncate text-[13px] font-semibold text-fg">{proof.title}</span>
                    </div>
                    <div class="flex shrink-0 items-center gap-2">
                      <span class="rounded bg-bg-active px-2 py-0.5 font-mono text-[10.5px] text-muted">
                        {proof.metricBadge}
                      </span>
                      <span class="font-mono text-xs text-faint">{isOpen() ? "−" : "+"}</span>
                    </div>
                  </button>
                  <Show when={isOpen()}>
                    <div class="border-t border-border bg-bg-deep px-3.5 py-3 text-xs leading-[1.5] text-muted">
                      <div class="grid grid-cols-1 gap-2.5 md:grid-cols-3">
                        <div>
                          <div class="font-mono text-[10px] text-warn uppercase">Problem</div>
                          <p class="m-0 mt-1">{proof.tension}</p>
                        </div>
                        <div>
                          <div class="font-mono text-[10px] text-accent uppercase">
                            Engineering Call
                          </div>
                          <p class="m-0 mt-1">{proof.decision}</p>
                        </div>
                        <div>
                          <div class="font-mono text-[10px] text-ok uppercase">
                            Verified Outcome
                          </div>
                          <p class="m-0 mt-1 text-fg">{proof.outcome}</p>
                        </div>
                      </div>
                    </div>
                  </Show>
                </div>
              );
            }}
          </For>
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
 * VARIANT 02 · THE ENGINEERING MONOGRAPH (EDITORIAL BROADSHEET)
 * High-contrast technical publication layout with three column essays,
 * runtime trade-off matrix, and curated gallery plates.
 * ========================================================================== */
const MonographModule: Component = () => {
  const [activeEssay, setActiveEssay] = createSignal<0 | 1 | 2>(0);

  const ESSAYS = [
    {
      num: "DISPATCH I",
      title: "One Scoring Authority, Not Two Formulas",
      kicker: "Trino · dbt · Metabase · Django · Pandas",
      quote:
        "When two systems compute the same KPI with different SQL/Pandas group-by order, patching rounding rules only hides the bug.",
      body: "At Labor Solutions, customer survey dashboards and downloaded Excel workbooks showed subtle score discrepancies. I wrote a deterministic counterexample generator proving that averaging facility means (54.31) vs. averaging respondent answers (54.90) diverges whenever facility headcount varies. We promoted the analytics cards to the single scoring authority and turned the Django export service into a pure projection and validation layer.",
      stat: "71.47 vs 71.40 · 2-site minimal proof",
    },
    {
      num: "DISPATCH II",
      title: "The Value of the Confident 'No'",
      kicker: "Next.js App Router · Bundle Telemetry · State Architecture",
      quote:
        "The fastest migration is the unshipped one that you disproved in an isolated production worktree in two hours.",
      body: "Before adopting a pitched rich-text editor replacement, I compiled both editors inside a production Next.js worktree: the candidate's lazy chunk weighed 350 KiB gzipped (10.1 MiB install) against our existing MDXEditor at 164 KiB gzipped (1.8 MiB install). Similarly, when prototyping Zustand for our SSR App Router web app (WPM-2255), per-request SSR store factory ceremonies erased its ergonomic edge—so I recommended staying on Redux Toolkit, while adopting Zustand on our client-only React Native app (WPM-3132).",
      stat: "164 KiB vs 350 KiB · 7–13h web churn saved",
    },
    {
      num: "DISPATCH III",
      title: "Self-Initiated Platform Velocity",
      kicker: "Next.js 16 · Barrel Elimination · Hyperfine CI",
      quote:
        "36% of my shipped engineering tickets (61 of 168) were proactive improvements filed while working in adjacent product code.",
      body: "Slow builds tax every engineer on every PR. I scoped and shipped a 3-ticket platform cluster—upgrading to Next.js 16 (WPM-3019), dismantling deep barrel imports (WPM-3029), and restructuring CI lint/build caching (WPM-3104). Verified with hyperfine on a quiet workstation, production build times dropped from 84.5s ± 11.4s to 40.6s ± 3.2s (2.08× faster).",
      stat: "84.5s → 40.6s · 2.08× faster build",
    },
  ] as const;

  return (
    <div class="space-y-5" data-variant-surface="monograph">
      {/* Broadsheet Masthead Banner */}
      <div class="rounded-xl border border-border bg-bg-deep p-5">
        <div class="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2.5 font-mono text-[10px] tracking-[0.12em] text-faint uppercase">
          <span>VOL. XIII · ISSUE 144 · PUNJAB, IN (REMOTE)</span>
          <span>THE ENGINEERING MONOGRAPH · EVIDENCE-FIRST PRODUCT UI</span>
          <span>13+ YRS SOFTWARE · 7+ YRS REACT/NEXT.JS</span>
        </div>

        <div class="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <For each={ESSAYS}>
            {(essay, index) => {
              const selected = () => activeEssay() === index();
              return (
                <button
                  type="button"
                  onClick={() => setActiveEssay(index() as 0 | 1 | 2)}
                  aria-pressed={selected() ? "true" : "false"}
                  class={[
                    "flex flex-col justify-between rounded-lg border p-3.5 text-left transition-colors",
                    selected()
                      ? "border-accent bg-bg-panel shadow-sm"
                      : "border-border bg-bg hover:bg-bg-hover",
                  ].join(" ")}
                >
                  <div>
                    <div class="font-mono text-[10px] tracking-[0.1em] text-accent uppercase">
                      {essay.num}
                    </div>
                    <h3 class="m-0 mt-1 text-[15px] leading-snug font-semibold text-fg">
                      {essay.title}
                    </h3>
                    <p class="m-0 mt-2 text-xs leading-[1.55] text-muted">{essay.body}</p>
                  </div>
                  <div class="mt-3 border-t border-border pt-2 font-mono text-[10.5px] text-ok">
                    {essay.stat}
                  </div>
                </button>
              );
            }}
          </For>
        </div>

        {/* Highlighted Pull-Quote from Active Dispatch */}
        <blockquote class="m-0 mt-4 rounded-lg border-l-2 border-accent bg-bg-panel px-4 py-3 text-xs italic text-fg">
          “{ESSAYS[activeEssay()]!.quote}”
          <span class="ml-2 not-italic font-mono text-[10.5px] text-faint">
            — {ESSAYS[activeEssay()]!.kicker}
          </span>
        </blockquote>
      </div>

      {/* Runtime Decision Matrix */}
      <div class="rounded-xl border border-border bg-bg-deep p-4">
        <div class="mb-2.5 font-mono text-[10px] tracking-[0.1em] text-faint uppercase">
          Architectural Trade-Off Matrix · Context Over Dogma
        </div>
        <div class="overflow-x-auto">
          <table class="w-full border-collapse text-left text-xs">
            <thead>
              <tr class="border-b border-border font-mono text-[10px] text-faint uppercase">
                <th class="py-2 pr-3">Decision Surface</th>
                <th class="py-2 px-3">Conventional Pitch</th>
                <th class="py-2 px-3">Empirical Finding</th>
                <th class="py-2 pl-3">Shipped Call</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border text-muted">
              <tr>
                <td class="py-2.5 pr-3 font-medium text-fg">Web State (WPM-2255)</td>
                <td class="py-2.5 px-3">Replace RTK with Zustand</td>
                <td class="py-2.5 px-3">App Router SSR requires per-request context store</td>
                <td class="py-2.5 pl-3 font-mono text-[11px] text-ok">Kept Redux Toolkit</td>
              </tr>
              <tr>
                <td class="py-2.5 pr-3 font-medium text-fg">Mobile State (WPM-3132)</td>
                <td class="py-2.5 px-3">Keep Jotai atoms</td>
                <td class="py-2.5 px-3">Client-only runtime has zero SSR store ceremony</td>
                <td class="py-2.5 pl-3 font-mono text-[11px] text-accent">Migrated to Zustand</td>
              </tr>
              <tr>
                <td class="py-2.5 pr-3 font-medium text-fg">Survey Filtering</td>
                <td class="py-2.5 px-3">Pre-aggregated SQL mart</td>
                <td class="py-2.5 px-3">Multi-select demographics double-counted respondents</td>
                <td class="py-2.5 pl-3 font-mono text-[11px] text-ok">
                  Respondent-Grain + Hybrid Mart
                </td>
              </tr>
              <tr>
                <td class="py-2.5 pr-3 font-medium text-fg">Indicator Backfill (WPM-3370)</td>
                <td class="py-2.5 px-3">Global PK backfill script</td>
                <td class="py-2.5 px-3">
                  Ambiguous lineage on PK &gt;= 10 across divergent surveys
                </td>
                <td class="py-2.5 pl-3 font-mono text-[11px] text-accent">
                  Association-Gated 500-Row Batches
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
 * VARIANT 03 · COMMAND DECK & PR GATEKEEPER
 * Interactive engineering workbench with instant domain filter, PR #155
 * 6-defect review gatekeeper inspector, and live system launcher.
 * ========================================================================== */
const CommandDeckModule: Component = () => {
  const [activeDefectId, setActiveDefectId] = createSignal<string>("DEF-01");
  const [domainFilter, setDomainFilter] = createSignal<string>("ALL");

  const activeDefect = () =>
    PR_155_DEFECTS.find((d) => d.id === activeDefectId()) ?? PR_155_DEFECTS[0]!;

  const filteredSystems = () => {
    const f = domainFilter();
    if (f === "ALL") return ALL_ENRICHED_WORK;
    if (f === "LIVE") return ALL_ENRICHED_WORK.filter((w) => Boolean(w.live));
    if (f === "BI")
      return ALL_ENRICHED_WORK.filter(
        (w) => w.folderSlug === "labor-solutions" || w.folderSlug === "advance-auto-parts",
      );
    return ALL_ENRICHED_WORK.filter((w) => w.folderSlug === "tools");
  };

  return (
    <div class="space-y-5" data-variant-surface="command">
      {/* Terminal Status Header */}
      <div class="rounded-xl border border-border bg-bg-deep p-4 font-mono text-xs">
        <div class="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2.5">
          <div class="flex items-center gap-2">
            <span class="size-2 rounded-full bg-ok" />
            <span class="text-fg">vk@workstation: ~/engineering-workbench</span>
          </div>
          <span class="text-[11px] text-faint">
            124 PRs (FY25-26) · 6 OKRs PIC · 44+ Agent Skills
          </span>
        </div>

        {/* PR #155 Review Gatekeeper Inspector */}
        <div class="mt-3">
          <div class="mb-2 flex flex-wrap items-center justify-between gap-2">
            <span class="text-[11px] text-accent uppercase">
              Review Gatekeeper · PR #155 (Card 7 Customer Analytics Migration — 6 Merge-Blocking
              Catches)
            </span>
            <span class="rounded bg-warn-soft px-2 py-0.5 text-[10px] text-warn">
              Caught Before Production Merge
            </span>
          </div>

          <div class="grid grid-cols-2 gap-1.5 sm:grid-cols-6">
            <For each={[...PR_155_DEFECTS]}>
              {(defect) => {
                const selected = () => activeDefectId() === defect.id;
                return (
                  <button
                    type="button"
                    onClick={() => setActiveDefectId(defect.id)}
                    aria-pressed={selected() ? "true" : "false"}
                    class={[
                      "rounded-md border px-2.5 py-1.5 text-left transition-colors",
                      selected()
                        ? "border-accent bg-bg-panel text-fg"
                        : "border-border bg-bg text-muted hover:bg-bg-hover",
                    ].join(" ")}
                  >
                    <div class="flex items-center justify-between text-[10px]">
                      <span class="font-bold text-accent">{defect.id}</span>
                      <span class={defect.severity === "BLOCKER" ? "text-warn" : "text-faint"}>
                        {defect.severity}
                      </span>
                    </div>
                  </button>
                );
              }}
            </For>
          </div>

          <div class="mt-2.5 rounded-lg border border-border bg-bg-panel p-3 font-sans">
            <div class="font-mono text-[11px] font-semibold text-fg">{activeDefect().location}</div>
            <div class="mt-2 grid grid-cols-1 gap-2.5 text-xs sm:grid-cols-3">
              <div>
                <span class="font-mono text-[10px] text-warn uppercase">Symptom</span>
                <p class="m-0 mt-0.5 text-muted">{activeDefect().symptom}</p>
              </div>
              <div>
                <span class="font-mono text-[10px] text-accent uppercase">Root Cause</span>
                <p class="m-0 mt-0.5 text-muted">{activeDefect().rootCause}</p>
              </div>
              <div>
                <span class="font-mono text-[10px] text-ok uppercase">Verification Fix</span>
                <p class="m-0 mt-0.5 text-fg">{activeDefect().fix}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filterable System & Live Launcher Matrix */}
      <div class="rounded-xl border border-border bg-bg-deep p-4">
        <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div class="font-mono text-[10px] tracking-[0.1em] text-faint uppercase">
            Shipped Systems &amp; Live Storefront Launcher ({filteredSystems().length})
          </div>
          <div class="flex items-center gap-1 font-mono text-[10.5px]">
            <For
              each={[
                { id: "ALL", label: "All (10)" },
                { id: "LIVE", label: "Live Apps (5)" },
                { id: "BI", label: "Enterprise BI & ML (5)" },
                { id: "TOOLS", label: "Local-First Tools (3)" },
              ]}
            >
              {(tab) => (
                <button
                  type="button"
                  onClick={() => setDomainFilter(tab.id)}
                  aria-pressed={domainFilter() === tab.id ? "true" : "false"}
                  class={[
                    "rounded px-2 py-1 transition-colors",
                    domainFilter() === tab.id
                      ? "bg-accent/16 text-accent font-semibold"
                      : "bg-bg-panel text-muted hover:bg-bg-hover",
                  ].join(" ")}
                >
                  {tab.label}
                </button>
              )}
            </For>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <For each={filteredSystems()}>
            {(item) => (
              <div class="flex items-center justify-between gap-3 rounded-lg border border-border bg-bg-panel p-2.5">
                <div class="min-w-0">
                  <div class="flex items-center gap-2">
                    <A
                      href={item.href}
                      class="truncate text-[13px] font-semibold text-fg no-underline hover:text-accent"
                    >
                      {item.title}
                    </A>
                    <span class="rounded bg-bg-active px-1.5 py-0.5 font-mono text-[9.5px] text-faint">
                      {item.folderTitle}
                    </span>
                  </div>
                  <p class="m-0 mt-0.5 truncate text-[11.5px] text-muted">
                    {item.outcomes[0]?.text}
                  </p>
                </div>
                <div class="flex shrink-0 items-center gap-1.5">
                  <Show when={item.live}>
                    {(liveUrl) => (
                      <a
                        href={liveUrl()}
                        target="_blank"
                        rel="noreferrer"
                        class="rounded border border-accent/30 bg-accent-soft px-2 py-1 font-mono text-[10px] font-medium text-accent no-underline hover:bg-accent/20"
                      >
                        Live ↗
                      </a>
                    )}
                  </Show>
                  <A
                    href={item.href}
                    class="rounded border border-border bg-bg-deep px-2 py-1 font-mono text-[10px] text-muted no-underline hover:bg-bg-hover hover:text-fg"
                  >
                    Case →
                  </A>
                </div>
              </div>
            )}
          </For>
        </div>

        {/* Open-Source & Agentic Tooling Row */}
        <div class="mt-3 border-t border-border pt-3">
          <div class="mb-2 font-mono text-[10px] tracking-[0.1em] text-faint uppercase">
            Open-Source Desktop, Mobile &amp; Agentic Tooling
          </div>
          <div class="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <For each={[...OPEN_SOURCE_EXTRAS]}>
              {(extra) => (
                <a
                  href={extra.href}
                  target="_blank"
                  rel="noreferrer"
                  class="flex flex-col justify-between rounded-lg border border-border bg-bg-panel p-2.5 no-underline hover:border-accent/40 hover:bg-bg-hover"
                >
                  <div>
                    <div class="flex items-center justify-between font-mono text-[9.5px] text-accent">
                      <span>{extra.tag}</span>
                      <span>GitHub ↗</span>
                    </div>
                    <div class="mt-1 text-xs font-semibold text-fg">{extra.title}</div>
                    <div class="mt-0.5 text-[11px] leading-[1.35] text-muted">{extra.blurb}</div>
                  </div>
                  <div class="mt-2 font-mono text-[9.5px] text-faint">{extra.stack}</div>
                </a>
              )}
            </For>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
 * VARIANT 04 · TEN-SECOND SIGNAL INDEX (SWISS MINIMAL + HOVER PREVIEW)
 * Ultra-dense, zero-fluff executive index with instant hover media preview
 * and one-click copy email / resume actions.
 * ========================================================================== */
const SignalIndexModule: Component = () => {
  const [hoveredCase, setHoveredCase] = createSignal<EnrichedWorkItem>(
    ALL_ENRICHED_WORK.find((w) => w.slug === "supplychain-plus") ?? ALL_ENRICHED_WORK[0]!,
  );
  const [copiedEmail, setCopiedEmail] = createSignal(false);

  const copyEmail = () => {
    navigator.clipboard?.writeText(CONTACT_EMAIL).catch(() => {});
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 1600);
  };

  return (
    <div class="space-y-4" data-variant-surface="signal">
      {/* Compact Swiss Signal Bar */}
      <div class="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-bg-deep px-3.5 py-2.5">
        <div class="flex flex-wrap items-center gap-3 font-mono text-[11px]">
          <span class="inline-flex items-center gap-1.5 font-semibold text-fg">
            <span class="size-2 rounded-full bg-ok" />
            10-Second Executive Scan
          </span>
          <span class="text-faint">·</span>
          <span class="text-muted">84.5s → 40.6s Build</span>
          <span class="text-faint">·</span>
          <span class="text-muted">71.47 vs 71.40 Parity</span>
          <span class="text-faint">·</span>
          <span class="text-muted">164 vs 350 KiB Gzip</span>
        </div>
        <div class="flex items-center gap-1.5">
          <button
            type="button"
            onClick={copyEmail}
            class="rounded border border-border bg-bg-panel px-2.5 py-1 font-mono text-[10.5px] text-fg hover:bg-bg-hover"
          >
            {copiedEmail() ? "Copied hello@vishalk.com ✓" : `Copy ${CONTACT_EMAIL}`}
          </button>
          <a
            href={RESUME_PDF_HREF}
            target="_blank"
            rel="noreferrer"
            class="rounded border border-accent/30 bg-accent-soft px-2.5 py-1 font-mono text-[10.5px] font-medium text-accent no-underline hover:bg-accent/20"
          >
            CV PDF ↗
          </a>
        </div>
      </div>

      {/* Split Index Table + Instant Live Media Plate */}
      <div class="grid grid-cols-1 gap-3.5 lg:grid-cols-[1.35fr_1fr]">
        <div class="divide-y divide-border overflow-hidden rounded-xl border border-border bg-bg-panel">
          <For each={[...ALL_ENRICHED_WORK]}>
            {(item, idx) => {
              const active = () => hoveredCase().slug === item.slug;
              return (
                <div
                  onMouseEnter={() => setHoveredCase(item)}
                  onFocusIn={() => setHoveredCase(item)}
                  class={[
                    "flex items-center justify-between gap-2 px-3 py-2 transition-colors",
                    active() ? "bg-bg-hover" : "hover:bg-bg-deep",
                  ].join(" ")}
                >
                  <div class="flex min-w-0 items-center gap-2.5">
                    <span class="w-5 shrink-0 font-mono text-[10px] text-faint">
                      {String(idx() + 1).padStart(2, "0")}
                    </span>
                    <A
                      href={item.href}
                      class="truncate text-xs font-semibold text-fg no-underline hover:text-accent"
                    >
                      {item.title}
                    </A>
                    <span class="hidden truncate text-[11px] text-muted sm:inline">
                      — {item.lede}
                    </span>
                  </div>
                  <div class="flex shrink-0 items-center gap-1.5 font-mono text-[10px]">
                    <Show when={item.live}>
                      {(live) => (
                        <a
                          href={live()}
                          target="_blank"
                          rel="noreferrer"
                          class="text-accent no-underline hover:underline"
                        >
                          live↗
                        </a>
                      )}
                    </Show>
                    <span class="text-faint">{item.folderTitle}</span>
                  </div>
                </div>
              );
            }}
          </For>
        </div>

        {/* Live Hover Inspection Plate */}
        <div class="flex flex-col justify-between rounded-xl border border-border bg-bg-deep p-3.5">
          <div>
            <div class="flex items-center justify-between gap-2 font-mono text-[10px] text-faint uppercase">
              <span>{hoveredCase().folderTitle}</span>
              <span>{hoveredCase().badge}</span>
            </div>
            <div class="mt-1 text-base font-semibold text-fg">{hoveredCase().title}</div>
            <p class="m-0 mt-1 text-xs leading-[1.45] text-muted">
              {hoveredCase().outcomes[0]?.text}
            </p>
            <Show when={hoveredCase().thumbSrc}>
              {(src) => (
                <div class="mt-3 h-36 w-full overflow-hidden rounded-lg border border-border bg-bg">
                  <img src={src()} alt="" class="size-full object-cover object-left-top" />
                </div>
              )}
            </Show>
          </div>
          <div class="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-2.5">
            <div class="flex flex-wrap gap-1">
              <For each={hoveredCase().stack.slice(0, 4)}>
                {(tech) => (
                  <span class="rounded bg-bg-active px-1.5 py-0.5 font-mono text-[10px] text-muted">
                    {tech}
                  </span>
                )}
              </For>
            </div>
            <A
              href={hoveredCase().href}
              class="font-mono text-[11px] font-semibold text-accent no-underline hover:underline"
            >
              Open Dossier →
            </A>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Interactive Creative Edition Showcase embedded on the Home/About stage.
 * Switches cleanly between the 4 creative variants (01 Ledger · 02 Monograph · 03 Deck · 04 Signal).
 */
export const CreativeEditionDeck: Component = () => {
  const { variant, setVariant } = useSiteVariant();

  const activeMeta = () => SITE_VARIANTS.find((item) => item.id === variant()) ?? SITE_VARIANTS[0]!;

  return (
    <section
      class="mt-8 max-w-[780px] border-t border-border pt-5"
      aria-label="Engineering proof studio"
      data-creative-edition={variant()}
    >
      <div class="mb-3.5 flex flex-wrap items-center justify-between gap-2.5">
        <div>
          <div class="font-mono text-[10px] tracking-[0.12em] text-accent uppercase">
            Interactive Edition · {activeMeta().num} / 04
          </div>
          <h2 class="m-0 mt-0.5 text-sm font-semibold text-fg">{activeMeta().title}</h2>
          <p class="m-0 mt-0.5 text-xs text-muted">{activeMeta().tagline}</p>
        </div>

        <div
          class="inline-flex items-center gap-1 rounded-lg border border-border bg-bg-deep p-1"
          role="group"
          aria-label="Select creative variant"
        >
          <For each={[...SITE_VARIANTS]}>
            {(item) => {
              const selected = () => variant() === item.id;
              return (
                <button
                  type="button"
                  onClick={() => setVariant(item.id)}
                  aria-pressed={selected() ? "true" : "false"}
                  class={[
                    "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                    selected()
                      ? "bg-accent/16 font-semibold text-accent shadow-[inset_0_0_0_1px_var(--vk-accent)]"
                      : "text-muted hover:bg-bg-hover hover:text-fg",
                  ].join(" ")}
                >
                  <span class="mr-1 font-mono text-[10px] opacity-75">{item.num}</span>
                  {item.shortLabel}
                </button>
              );
            }}
          </For>
        </div>
      </div>

      <Switch fallback={<ProofLedgerModule />}>
        <Match when={variant() === "ledger"}>
          <ProofLedgerModule />
        </Match>
        <Match when={variant() === "monograph"}>
          <MonographModule />
        </Match>
        <Match when={variant() === "command"}>
          <CommandDeckModule />
        </Match>
        <Match when={variant() === "signal"}>
          <SignalIndexModule />
        </Match>
      </Switch>
    </section>
  );
};
