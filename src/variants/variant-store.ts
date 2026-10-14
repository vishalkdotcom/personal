import { createSignal } from "solid-js";
import { WORK_FOLDERS, workCaseHref, type WorkCase } from "../work/inventory";
import { tryResolveWorkMediaSrc } from "../work/work-case-media";

export type SiteVariantId = "ledger" | "monograph" | "command" | "signal";

export type SiteVariantMeta = {
  id: SiteVariantId;
  num: "01" | "02" | "03" | "04";
  shortLabel: string;
  title: string;
  tagline: string;
};

/**
 * Default live experience for vishalk.com.
 * Change this single constant to lock any of the 4 creative variants ("ledger" | "monograph" | "command" | "signal").
 */
export const DEFAULT_SITE_VARIANT: SiteVariantId = "ledger";

export const SITE_VARIANT_STORAGE_KEY = "vk-site-variant";

export const SITE_VARIANTS: readonly SiteVariantMeta[] = [
  {
    id: "ledger",
    num: "01",
    shortLabel: "Ledger",
    title: "Proof Ledger & Counterexample Lab",
    tagline: "Interactive scoring drift simulator, hyperfine build telemetry & visual dossiers.",
  },
  {
    id: "monograph",
    num: "02",
    shortLabel: "Monograph",
    title: "The Engineering Monograph",
    tagline: "Broadsheet field dispatches, architecture trade-off essays & visual plates.",
  },
  {
    id: "command",
    num: "03",
    shortLabel: "Deck",
    title: "Command Deck & PR Gatekeeper",
    tagline: "Keyboard-first instrument panel, PR #155 defect inspector & live app launcher.",
  },
  {
    id: "signal",
    num: "04",
    shortLabel: "Signal",
    title: "Ten-Second Signal Index",
    tagline: "Zero-fluff Swiss index with instant hover media plates and one-click actions.",
  },
] as const;

const VALID_IDS = new Set<SiteVariantId>(["ledger", "monograph", "command", "signal"]);

const NUM_TO_ID: Record<string, SiteVariantId> = {
  "1": "ledger",
  "01": "ledger",
  ledger: "ledger",
  "2": "monograph",
  "02": "monograph",
  monograph: "monograph",
  "3": "command",
  "03": "command",
  command: "command",
  deck: "command",
  "4": "signal",
  "04": "signal",
  signal: "signal",
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
    favorableCount: 259,
    facilityScore: 61.67,
  },
  {
    id: "FAC-02",
    name: "Ho Chi Minh Textiles B",
    region: "APAC",
    respondents: 310,
    favorableCount: 184,
    facilityScore: 59.35,
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
    favorableCount: 74,
    facilityScore: 52.86,
  },
  {
    id: "FAC-05",
    name: "Dhaka Garment Unit 4",
    region: "S. Asia",
    respondents: 265,
    favorableCount: 142,
    facilityScore: 53.58,
  },
  {
    id: "FAC-06",
    name: "Bursa Automotive Trim",
    region: "EMEA",
    respondents: 64,
    favorableCount: 31,
    facilityScore: 48.44,
  },
  {
    id: "FAC-07",
    name: "Phnom Penh Footwear C",
    region: "APAC",
    respondents: 48,
    favorableCount: 24,
    facilityScore: 50.0,
  },
  {
    id: "FAC-08",
    name: "Tanger Logistics Hub",
    region: "EMEA",
    respondents: 38,
    favorableCount: 20,
    facilityScore: 52.63,
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
    title: "Single Scoring Authority (Dashboard ↔ Excel Parity)",
    domain: "Reporting & BI",
    metricBadge: "71.47 vs 71.40 · 0 Drift",
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
    metricBadge: "84.5s → 40.6s (2.08×)",
    beforeAfter: { before: "84.5s ± 11.4s", after: "40.6s ± 3.2s", unit: "hyperfine" },
    tension:
      "Production Next.js builds were averaging 84.5s and slowing every PR verification cycle across the frontend team.",
    decision:
      "Self-initiated a 3-ticket cluster (WPM-3019 Next.js 16 upgrade, WPM-3029 barrel-file elimination, WPM-3104 CI lint/format/build caching) and benchmarked cold/warm runs with hyperfine.",
    outcome:
      "Cut production build time in half (84.5s → 40.6s, 2.08× speedup) with reproducible hyperfine distributions.",
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
      "Proved candidate was 2.13× heavier gzipped (350 KiB vs 164 KiB; 10.1 MiB vs 1.8 MiB install). Rejected migration with hard numbers.",
    stack: ["Next.js", "Webpack/Turbopack", "MDXEditor", "Bundle Analysis"],
  },
  {
    id: "runtime-state",
    code: "PROOF-04",
    title: "Context-Specific State: RTK on SSR Web, Zustand on Mobile",
    domain: "Architecture Calls",
    metricBadge: "7–13h Churn Saved",
    tension:
      "Blanket state-library migrations often ignore runtime constraints between SSR App Router web apps and client-only mobile apps.",
    decision:
      "Prototyped a real slice in WPM-2255; found Next.js App Router per-request SSR store factories negated Zustand's simplicity—reversed my own initial lean and kept Redux Toolkit. Later migrated Jotai → Zustand in the client-only React Native app (WPM-3132).",
    outcome:
      "Avoided 7–13 hours of zero-ROI web rewrite while simplifying mobile state in a single clean PR.",
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
    location: "SummaryScoreCard.tsx · useGetSummaryQuery gate",
    symptom: "Facility score cards rendered blank when comparison filter was toggled off.",
    rootCause: "Summary query hook was accidentally gated behind comparison-mode boolean.",
    fix: "Decoupled base summary fetch from comparison query skip condition.",
  },
  {
    id: "DEF-02",
    severity: "BLOCKER",
    location: "questionTypeMapper.ts · numeric fallback swap",
    symptom: "Single-choice questions fell back to open-text renderer on legacy surveys.",
    rootCause: "Numeric question-type fallback constants 1 and 3 were transposed during refactor.",
    fix: "Restored canonical enum mapping and added exhaustive unit assertions.",
  },
  {
    id: "DEF-03",
    severity: "CRITICAL",
    location: "CategoryDrilldownTable.tsx · pagination reset",
    symptom: "Switching demographic segment on page 3 showed empty table state.",
    rootCause: "Filter change mutated query params without resetting page offset to 0.",
    fix: "Bound filter signature change to deterministic page=0 reset.",
  },
  {
    id: "DEF-04",
    severity: "CRITICAL",
    location: "ExportParityAdapter.ts · null score coercion",
    symptom: "Unanswered optional categories exported as 0.0% instead of N/A.",
    rootCause: "Number(null) coerced missing averages to 0 before Excel cell formatting.",
    fix: "Preserved null sentinel through serializer to render explicit '—' cells.",
  },
  {
    id: "DEF-05",
    severity: "HIGH",
    location: "GeographicRiskMap.tsx · stale tooltip closure",
    symptom: "Hovering country polygons after date-range change displayed previous period counts.",
    rootCause: "Memoized GeoJSON layer omitted active date window from dependency tuple.",
    fix: "Keyed layer feature properties on normalized filter hash.",
  },
  {
    id: "DEF-06",
    severity: "HIGH",
    location: "eNPSBreakdownBar.tsx · rounding sum != 100%",
    symptom:
      "Promoter + Passive + Detractor labels summed to 99.9% or 100.1% on edge distributions.",
    rootCause: "Independent Math.round calls on each bucket without remainder reconciliation.",
    fix: "Aligned with backend banker's rounding and largest-remainder display normalization.",
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
    title: "April Desktop",
    tag: "Desktop App",
    stack: "Tauri 2 · Rust · React 19 · SQLite",
    blurb: "Native Story Point & Jira/GitHub PR tracker with incremental JQL watermarks.",
    href: "https://github.com/vishalkdotcom/april",
  },
  {
    title: "EduCal",
    tag: "Mobile App",
    stack: "Expo · React Native · Gemini Structured Output",
    blurb: "Education savings planner with live currency conversion & 18 Maestro E2E flows.",
    href: "https://github.com/vishalkdotcom/educal",
  },
  {
    title: "Agent Skills Library",
    tag: "AI Engineering",
    stack: "44+ Workflows · Playwright · Spec-Driven",
    blurb: "Composable skills: grill-with-docs → to-spec → to-tickets → implement → code-review.",
    href: "https://github.com/vishalkdotcom/skills",
  },
  {
    title: "Windows Dotfiles",
    tag: "Workstation",
    stack: "Chezmoi · PowerShell 7 AST · Windows Terminal",
    blurb: "Declarative workstation with AST-rewriting Unix coreutils & warm-ink themes.",
    href: "https://github.com/vishalkdotcom/dotfiles",
  },
] as const;
