import { createSignal } from "solid-js";
import { WORK_FOLDERS, workCaseHref, type WorkCase } from "../work/inventory";
import { tryResolveWorkMediaSrc } from "../work/work-case-media";

export type SiteVariantId = "synth" | "cosmos" | "arcade" | "spatial" | "brutalist";

export type SiteVariantMeta = {
  id: SiteVariantId;
  num: "01" | "02" | "03" | "04" | "05";
  shortLabel: string;
  title: string;
  tagline: string;
};

/**
 * Default live experience for vishalk.com.
 * Change this single constant to lock any of the 5 creative worlds ("synth" | "cosmos" | "arcade" | "spatial" | "brutalist").
 */
export const DEFAULT_SITE_VARIANT: SiteVariantId = "synth";

export const SITE_VARIANT_STORAGE_KEY = "vk-site-variant-v2";

export const SITE_VARIANTS: readonly SiteVariantMeta[] = [
  {
    id: "synth",
    num: "01",
    shortLabel: "Synth",
    title: "Modular Synth & CRT Oscilloscope Rack",
    tagline:
      "Live 60fps Lissajous/wave oscilloscope, rotary attenuverters, WebAudio synth & sequencer pads.",
  },
  {
    id: "cosmos",
    num: "02",
    shortLabel: "Cosmos",
    title: "Constellation Force-Directed Observatory",
    tagline:
      "Interactive spring-physics star map where you drag & orbit 14 engineering stars in deep space.",
  },
  {
    id: "arcade",
    num: "03",
    shortLabel: "Arcade",
    title: "1986 Boss-Rush Proof Cabinet",
    tagline:
      "Playable retro CRT boss battles where you fire counterexamples & worktree benchmarks.",
  },
  {
    id: "spatial",
    num: "04",
    shortLabel: "VK-OS",
    title: "Spatial Workstation OS // 2026",
    tagline:
      "Multi-window desktop environment with live Score Lab, PR #155 Diff Gate, and Terminal REPL.",
  },
  {
    id: "brutalist",
    num: "05",
    shortLabel: "Poster",
    title: "Swiss Kinetic Brutalist Exhibition",
    tagline: "Monumental architectural typography, interactive hover lens & high-contrast gallery.",
  },
] as const;

const VALID_IDS = new Set<SiteVariantId>(["synth", "cosmos", "arcade", "spatial", "brutalist"]);

const NUM_TO_ID: Record<string, SiteVariantId> = {
  "1": "synth",
  "01": "synth",
  synth: "synth",
  ledger: "synth",
  "2": "cosmos",
  "02": "cosmos",
  cosmos: "cosmos",
  monograph: "cosmos",
  "3": "arcade",
  "03": "arcade",
  arcade: "arcade",
  command: "arcade",
  deck: "arcade",
  "4": "spatial",
  "04": "spatial",
  spatial: "spatial",
  os: "spatial",
  signal: "spatial",
  "5": "brutalist",
  "05": "brutalist",
  brutalist: "brutalist",
  poster: "brutalist",
};

export function parseVariantParam(raw: string | null | undefined): SiteVariantId | undefined {
  if (!raw) return undefined;
  const cleaned = raw.trim().toLowerCase();
  return NUM_TO_ID[cleaned];
}

export function readInitialSiteVariant(): SiteVariantId {
  if (typeof window !== "undefined") {
    try {
      const urlVariant = parseVariantParam(new URLSearchParams(window.location.search).get("v"));
      if (urlVariant) return urlVariant;
    } catch {
      // ignore URL parse issues
    }
    try {
      const saved = localStorage.getItem(SITE_VARIANT_STORAGE_KEY);
      if (saved && VALID_IDS.has(saved as SiteVariantId)) {
        return saved as SiteVariantId;
      }
    } catch {
      // ignore storage issues
    }
  }
  return DEFAULT_SITE_VARIANT;
}

const [activeVariant, setActiveVariantSignal] =
  createSignal<SiteVariantId>(readInitialSiteVariant());

export function useSiteVariant() {
  const selectVariant = (next: SiteVariantId, syncUrl = false) => {
    setActiveVariantSignal(next);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(SITE_VARIANT_STORAGE_KEY, next);
      } catch {
        // ignore storage errors
      }
      if (syncUrl) {
        try {
          const url = new URL(window.location.href);
          url.searchParams.set("v", next);
          window.history.replaceState(window.history.state, "", url.toString());
        } catch {
          // ignore history errors in memory router
        }
      }
    }
  };

  return {
    variant: activeVariant,
    setVariant: selectVariant,
  };
}

/**
 * Authentic 8-facility dataset from the scoring parity investigation.
 * Demonstrates why Facility-First (mean of facility means) vs Question-First (respondent/question grain) diverge.
 */
export type FacilitySample = {
  id: string;
  name: string;
  region: string;
  respondents: number;
  favorableCount: number;
  facilityScore: number;
};

export const FACILITY_PARITY_SAMPLES: readonly FacilitySample[] = [
  {
    id: "FAC-01",
    name: "Shenzhen Precision Assembly",
    region: "APAC",
    respondents: 420,
    favorableCount: 233,
    facilityScore: 55.48,
  },
  {
    id: "FAC-02",
    name: "Ho Chi Minh Textiles B",
    region: "APAC",
    respondents: 310,
    favorableCount: 172,
    facilityScore: 55.48,
  },
  {
    id: "FAC-03",
    name: "Penang Microelectronics",
    region: "APAC",
    respondents: 195,
    favorableCount: 109,
    facilityScore: 55.9,
  },
  {
    id: "FAC-04",
    name: "Monterrey Wiring Systems",
    region: "LATAM",
    respondents: 140,
    favorableCount: 78,
    facilityScore: 55.71,
  },
  {
    id: "FAC-05",
    name: "Dhaka Garment Unit 4",
    region: "S. Asia",
    respondents: 265,
    favorableCount: 143,
    facilityScore: 54.21,
  },
  {
    id: "FAC-06",
    name: "Bursa Automotive Trim",
    region: "EMEA",
    respondents: 64,
    favorableCount: 33,
    facilityScore: 51.56,
  },
  {
    id: "FAC-07",
    name: "Phnom Penh Footwear C",
    region: "APAC",
    respondents: 48,
    favorableCount: 25,
    facilityScore: 52.08,
  },
  {
    id: "FAC-08",
    name: "Tanger Logistics Hub",
    region: "EMEA",
    respondents: 39,
    favorableCount: 20,
    facilityScore: 54.06,
  },
] as const;

export const TWO_FACILITY_COUNTEREXAMPLE = {
  questionFirstScore: "71.47",
  facilityFirstScore: "71.40",
  delta: "+0.07",
  summary:
    "2-facility minimal reproduction: Trino analytics cards weighted by question responses (71.47) while Django Excel exports averaged facility means (71.40).",
} as const;

export const EIGHT_FACILITY_COUNTEREXAMPLE = {
  questionFirstScore: "54.90",
  facilityFirstScore: "54.31",
  delta: "+0.59",
  summary:
    "8-facility production slice: unequal respondent volume (420 vs 38) caused a 0.59-point drift between dashboard cards and downloaded Excel workbooks.",
} as const;

export type ArchitectureProof = {
  id: string;
  code: string;
  title: string;
  domain: "Reporting & BI" | "Platform & Perf" | "Architecture Calls" | "Data Integrity";
  metricBadge: string;
  beforeAfter?: { before: string; after: string; unit: string };
  tension: string;
  decision: string;
  outcome: string;
  stack: readonly string[];
};

export const ARCHITECTURE_PROOFS: readonly ArchitectureProof[] = [
  {
    id: "scoring-authority",
    code: "PROOF-01",
    title: "Single Scoring Authority (Dashboard <-> Excel Parity)",
    domain: "Reporting & BI",
    metricBadge: "54.90 vs 54.31 · 0 Drift",
    beforeAfter: { before: "54.31 (Excel)", after: "54.90 (Unified)", unit: "score" },
    tension:
      "Customer dashboards (Metabase/Trino) and Excel exports (Django/Pandas) reported different scores for the exact same survey filter state.",
    decision:
      "Built a Python + Trino counterexample harness proving question-first vs. facility-first aggregation diverged whenever facility sample sizes varied. Made analytics cards the single scoring authority and reduced Django to validation + pivot formatting.",
    outcome:
      "100% numeric parity across web reporting and Excel downloads; zero dual-formula maintenance.",
    stack: ["Next.js", "Trino SQL", "dbt", "Metabase SDK", "Django", "Pandas"],
  },
  {
    id: "build-velocity",
    code: "PROOF-02",
    title: "Proactive Next.js 16 & De-Barrel Build Cluster",
    domain: "Platform & Perf",
    metricBadge: "84.5s -> 40.6s (2.08x)",
    beforeAfter: { before: "84.5s +/- 11.4s", after: "40.6s +/- 3.2s", unit: "hyperfine" },
    tension:
      "Production Next.js builds were averaging 84.5s and slowing every PR verification cycle across the frontend team.",
    decision:
      "Self-initiated a 3-ticket cluster (WPM-3019 Next.js 16 upgrade, WPM-3029 barrel-file elimination, WPM-3104 CI lint/format/build caching) and benchmarked cold/warm runs with hyperfine.",
    outcome:
      "Cut production build time in half (84.5s -> 40.6s, 2.08x speedup) with reproducible hyperfine distributions.",
    stack: ["Next.js 16", "TypeScript", "Hyperfine", "GitHub Actions"],
  },
  {
    id: "editor-bakeoff",
    code: "PROOF-03",
    title: "The Confident 'No': Rich-Text Editor Bake-Off",
    domain: "Architecture Calls",
    metricBadge: "164 KiB vs 350 KiB gzip",
    beforeAfter: { before: "350 KiB (Candidate)", after: "164 KiB (Kept MDXEditor)", unit: "gzip" },
    tension:
      "Team proposed replacing MDXEditor with a supposedly lighter rich-text editor package across admin authoring forms.",
    decision:
      "Built an isolated Next.js production worktree before committing to migration. Measured lazy-loaded chunks and node_modules footprint under real production bundling.",
    outcome:
      "Proved candidate was 2.13x heavier gzipped (350 KiB vs 164 KiB; 10.1 MiB vs 1.8 MiB install). Rejected migration with hard numbers.",
    stack: ["Next.js", "Webpack/Turbopack", "MDXEditor", "Bundle Analysis"],
  },
  {
    id: "runtime-state",
    code: "PROOF-04",
    title: "Context-Specific State: RTK on SSR Web, Zustand on Mobile",
    domain: "Architecture Calls",
    metricBadge: "7-13h Churn Saved",
    tension:
      "Blanket state-library migrations often ignore runtime constraints between SSR App Router web apps and client-only mobile apps.",
    decision:
      "Prototyped a real slice in WPM-2255; found Next.js App Router per-request SSR store factories negated Zustand's simplicity - reversed my own initial lean and kept Redux Toolkit. Later migrated Jotai -> Zustand in the client-only React Native app (WPM-3132).",
    outcome:
      "Avoided 7-13 hours of zero-ROI web rewrite while simplifying mobile state in a single clean PR.",
    stack: ["Redux Toolkit", "Zustand", "Next.js App Router", "React Native"],
  },
  {
    id: "respondent-grain",
    code: "PROOF-05",
    title: "Respondent-Grain Analytics & Custom Metabase Fork",
    domain: "Reporting & BI",
    metricBadge: "0 Double-Counting · 9 Fork PRs",
    tension:
      "Multi-select demographic filters double-counted respondents in pre-aggregated marts, and stock Metabase lacked required chart/rounding behaviors.",
    decision:
      "Re-architected dbt/Trino marts at respondent grain using relational division (OR within field, AND across fields) while keeping a fast pre-aggregated path for unfiltered loads. Shipped 9 PRs to our custom Metabase fork.",
    outcome:
      "Eliminated multi-select inflation and shipped custom Response Distribution charts, SQL Pivot, banker's rounding, and Windows Chromium flag emoji polyfills.",
    stack: ["dbt", "Trino", "Metabase Fork", "Clojure/React", "SQL"],
  },
  {
    id: "indicator-lineage",
    code: "PROOF-06",
    title: "Multilingual Indicator Bank & Backfill Lineage Guard",
    domain: "Data Integrity",
    metricBadge: "45/45 Regression Tests",
    tension:
      "Synchronizing reusable questions across 4 admin surfaces and Excel templates risked overwriting divergent survey questions when legacy PKs collided (PK >= 10).",
    decision:
      "Designed protected OpenPyXL round-trip workbooks with hidden stable IDs, partial-success validation, and association-gated 500-row atomic backfill batches (WPM-3370).",
    outcome:
      "45/45 regression tests green; zero cross-tenant or divergent-question overwrites in production.",
    stack: ["Django", "Next.js", "OpenPyXL", "PostgreSQL", "TypeScript"],
  },
] as const;

export type PrDefectCatch = {
  id: string;
  severity: "BLOCKER" | "CRITICAL" | "HIGH";
  location: string;
  symptom: string;
  rootCause: string;
  fix: string;
};

/**
 * Real review gatekeeping record from PR #155 (Card 7 customer-facing analytics migration).
 */
export const PR_155_DEFECTS: readonly PrDefectCatch[] = [
  {
    id: "DEF-01",
    severity: "BLOCKER",
    location: "SummaryScoreCard.tsx · brand-only gate",
    symptom:
      "getSummaryData() gated behind brand-only check broke SurveyScoreCard for non-brand facility users.",
    rootCause:
      "Card 7's primary audience was facility dashboards, but summary fetch was locked behind brand condition.",
    fix: "Decoupled facility score fetch from brand-only guard so all facility dashboards render live scores.",
  },
  {
    id: "DEF-02",
    severity: "BLOCKER",
    location: "questionTypeMapper.ts · cases 1 & 3 swapped",
    symptom:
      "Questions missing a dic_key silently rendered the wrong chart with wrong placeholder options.",
    rootCause:
      "Numeric question_type fallback had cases 1 (CHECK_BOX) and 3 (RATING_SCALE) swapped against canonical constants.",
    fix: "Restored canonical enum mapping for cases 1 and 3 and added unit assertions.",
  },
  {
    id: "DEF-03",
    severity: "CRITICAL",
    location: "QuestionDistributionContainer.tsx · default coercion",
    symptom:
      "Free-text, email, and date questions rendered plausible-looking but meaningless single-select charts.",
    rootCause:
      "Unsupported question types passed straight through and were coerced to SINGLE_SELECT in a default switch branch.",
    fix: "Explicitly filtered out non-chartable question types before container projection.",
  },
  {
    id: "DEF-04",
    severity: "CRITICAL",
    location: "mergeQuestionData.ts · overly broad type guard",
    symptom: "Valid backend API responses were discarded and replaced with all-zero placeholders.",
    rootCause:
      "A type-mismatch guard intended for one eNPS edge case discarded any real API response on minor type differences.",
    fix: "Scoped the guard strictly to the eNPS schema boundary while preserving valid distribution payloads.",
  },
  {
    id: "DEF-05",
    severity: "HIGH",
    location: "useSurveyFilters.ts · stale client filter state",
    symptom:
      "Filters applied for a previously selected client stayed active in API params for the newly selected client.",
    rootCause:
      "Client change did not flush pending filter params until the user manually clicked Apply again.",
    fix: "Reset active filter query state atomically whenever the selected client ID changes.",
  },
  {
    id: "DEF-06",
    severity: "HIGH",
    location: ".eslintrc.js · repo-wide @ts-ignore relaxation",
    symptom:
      "Repo-wide ban on @ts-ignore was disabled just to cover 8 local @ts-expect-error swaps.",
    rootCause:
      "@ts-ignore suppresses indefinitely and masks future bugs, whereas @ts-expect-error fails once fixed.",
    fix: "Restored repo-wide rule and used line-scoped typed narrowings.",
  },
] as const;

export type EnrichedWorkItem = {
  folderSlug: string;
  folderTitle: string;
  folderFraming: string;
  slug: string;
  href: string;
  title: string;
  badge: "Production" | "Prototype";
  surface: "public-storefront" | "internal-dossier";
  live?: string;
  github?: string;
  role: string;
  lede: string;
  outcomes: readonly { label: string; text: string }[];
  stack: readonly string[];
  thumbSrc?: string;
  allMedia: readonly { label: string; src: string; resolvedSrc?: string }[];
};

const GITHUB_BY_SLUG: Record<string, string> = {
  "supplychain-plus": "https://github.com/vishalkdotcom/supplychain-plus",
  snap2paper: "https://github.com/vishalkdotcom/Snap2Paper",
  photogrid: "https://github.com/vishalkdotcom/photogrid",
  pdfgrid: "https://github.com/vishalkdotcom/pdfgrid",
};

function enrichCase(
  folderSlug: string,
  folderTitle: string,
  folderFraming: string,
  workCase: WorkCase,
): EnrichedWorkItem {
  const allMedia = (workCase.media ?? []).map((slide) => ({
    label: slide.label,
    src: slide.src,
    resolvedSrc: tryResolveWorkMediaSrc(slide.src),
  }));
  return {
    folderSlug,
    folderTitle,
    folderFraming,
    slug: workCase.slug,
    href: workCaseHref(folderSlug, workCase.slug),
    title: workCase.title,
    badge: workCase.badge,
    surface: workCase.surface,
    live: workCase.surface === "public-storefront" ? workCase.live : undefined,
    github: GITHUB_BY_SLUG[workCase.slug],
    role: workCase.role,
    lede: workCase.lede ?? "",
    outcomes: workCase.outcomes,
    stack: workCase.stack,
    thumbSrc: allMedia[0]?.resolvedSrc,
    allMedia,
  };
}

export const ALL_ENRICHED_WORK: readonly EnrichedWorkItem[] = WORK_FOLDERS.flatMap((folder) =>
  folder.cases.map((workCase) => enrichCase(folder.slug, folder.title, folder.framing, workCase)),
);

export type OpenSourceExtra = {
  title: string;
  tag: string;
  stack: string;
  blurb: string;
  href: string;
};

export const OPEN_SOURCE_EXTRAS: readonly OpenSourceExtra[] = [
  {
    title: "Agent Skills Library",
    tag: "AI Engineering",
    stack: "44+ Workflows · Playwright · Spec-Driven",
    blurb:
      "Composable skills: grill-with-docs -> to-spec -> to-tickets -> implement -> code-review.",
    href: "https://github.com/vishalkdotcom/skills",
  },
  {
    title: "Windows Dotfiles",
    tag: "Workstation",
    stack: "Chezmoi · PowerShell 7 AST · Windows Terminal",
    blurb: "Declarative workstation with AST-rewriting Unix coreutils & PowerToys FancyZones.",
    href: "https://github.com/vishalkdotcom/dotfiles",
  },
] as const;
