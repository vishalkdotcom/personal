/** Locked v1 Work inventory — folders, cases, badges. Omitted cases stay out. */

export type WorkBadge = "Production" | "Prototype";

export type WorkSurface = "public-storefront" | "internal-dossier";

/**
 * Stage carousel slide — label + inventory-relative `src` under `src/images/`.
 * The stage resolves `src` to a Vite URL.
 */
export type WorkMediaSlide = {
  label: string;
  src: string;
};

/** Internal Dossier artifact block (problem→fix, what shipped, …). */
export type WorkArtifact = {
  title: string;
  body: string;
  /** Accent callout body — used for problem→fix tension. */
  emphasis?: "callout";
};

/** Outcome lead-label + claim text — Public Claims only when filled. */
export type WorkOutcome = {
  label: string;
  text: string;
};

type WorkCaseShared = {
  slug: string;
  title: string;
  badge: WorkBadge;
  /** Context Rail Role stub — richer copy in later case tickets. */
  role: string;
  /** Center + Context Rail Outcomes — Public Claims only when filled. */
  outcomes: WorkOutcome[];
  /** Context Rail Stack — always shown expanded. */
  stack: string[];
  /**
   * Proof-first stage lede (Public Claims only).
   * When set, the case narrative ships instead of a stub.
   */
  lede?: string;
  /** Stage carousel slides — locked cases wire inventory `src` assets. */
  media?: WorkMediaSlide[];
};

export type PublicStorefrontCase = WorkCaseShared & {
  surface: "public-storefront";
  /** Context Rail Live URL — omit when there is no public HTTP URL. */
  live?: string;
};

export type InternalDossierCase = WorkCaseShared & {
  surface: "internal-dossier";
  /** Artifact blocks under the outcomes list. */
  artifacts?: WorkArtifact[];
};

export type WorkCase = PublicStorefrontCase | InternalDossierCase;

export type WorkFolder = {
  slug: string;
  title: string;
  /** Claim-safe employer · role · context line for `/work` group headers. */
  framing: string;
  cases: WorkCase[];
};

export const WORK_FOLDERS: WorkFolder[] = [
  {
    slug: "labor-solutions",
    title: "Labor Solutions",
    framing: "Labor Solutions · Senior Frontend · reporting & survey product UI",
    cases: [
      {
        slug: "engage-reporting",
        title: "Engage reporting",
        badge: "Production",
        surface: "internal-dossier",
        role: "Senior Frontend · Labor Solutions · Engage reporting",
        lede: "Engage questionnaire reporting — Summary, Categories, and Miscellaneous with Metabase embeds, risk maps, and one scoring path for dashboards and exports.",
        outcomes: [
          {
            label: "Parity",
            text: "Dashboards and Excel disagreed on scores (facility-first vs question-first). Exports now follow the analytics cards as the single authority.",
          },
          {
            label: "Depth",
            text: "Reporting artifacts shipped in-product: Summary, Categories, and Miscellaneous with Metabase embeds, risk indicators, geographic/category risk maps, and top/bottom sites",
          },
        ],
        artifacts: [
          {
            title: "Problem → fix",
            emphasis: "callout",
            body: "Facility-first vs question-first aggregations drifted scores between dashboard and Excel. Analytics cards became the single scoring authority; exports aligned.",
          },
          {
            title: "What shipped",
            body: "Summary, Categories, and Miscellaneous with Metabase embeds, risk indicators, geographic/category risk maps, and top/bottom sites.",
          },
        ],
        stack: ["React", "Next.js", "TypeScript", "Metabase Embedding SDK", "Redux Toolkit"],
        media: [
          { label: "Shot 1 · Shell", src: "work/engage-reporting/shell.png" },
          { label: "Shot 2 · Summary", src: "work/engage-reporting/summary.png" },
          { label: "Shot 3 · eNPS", src: "work/engage-reporting/enps.png" },
          { label: "Shot 4 · Question results", src: "work/engage-reporting/question-results.png" },
          { label: "Shot 5 · Overall table", src: "work/engage-reporting/overall-table.png" },
        ],
      },
      {
        slug: "indicator-bank",
        title: "Indicator Bank",
        badge: "Production",
        surface: "internal-dossier",
        role: "Senior Frontend · Labor Solutions · Indicator Bank",
        lede: "Multilingual Indicator Bank — reusable questions and answer sets across Django and Next.js with protected Excel import/export and survey association.",
        outcomes: [
          {
            label: "Surface",
            text: "Built a multilingual Indicator Bank across Django and Next.js — reusable questions/answer sets and four administration surfaces (Indicators, Questions, Answer Sets, Manage Associations)",
          },
          {
            label: "Integrity",
            text: "Protected Excel import/export with partial-success validation, soft deletion, and idempotent survey association for reusable survey content",
          },
        ],
        artifacts: [
          {
            title: "What shipped",
            body: "Indicators, Questions, Answer Sets, and Manage Associations — with protected Excel import/export and reusable survey content across Django and Next.js.",
          },
        ],
        stack: ["Django", "Next.js", "React", "TypeScript", "Excel import/export"],
        media: [
          { label: "Shot 1 · Indicators", src: "work/indicator-bank/indicators.png" },
          { label: "Shot 2 · Questions", src: "work/indicator-bank/questions.png" },
          { label: "Shot 3 · Answer Sets", src: "work/indicator-bank/answer-sets.png" },
          { label: "Shot 4 · Associations", src: "work/indicator-bank/associations.png" },
        ],
      },
    ],
  },
  {
    slug: "advance-auto-parts",
    title: "Advance Auto Parts",
    framing: "Advance Auto Parts · Frontend Engineer · store KPI & ML ops",
    cases: [
      {
        slug: "measurement-framework",
        title: "Measurement Framework",
        badge: "Production",
        surface: "internal-dossier",
        role: "Frontend Engineer · Advance Auto Parts · Measurement Framework",
        lede: "Store KPI measurement UI — trends, filters, and drill-downs for operational and leadership stakeholders.",
        outcomes: [
          {
            label: "UI",
            text: "Built the store KPI measurement UI (Next.js, Tremor/Nivo, TypeScript, Snowflake) serving operational and leadership stakeholders with trends, filters, and drill-down views",
          },
        ],
        artifacts: [
          {
            title: "What shipped",
            body: "Next.js, Tremor/Nivo, TypeScript, and Snowflake UI serving operational and leadership stakeholders with trends, filters, and drill-down views.",
          },
        ],
        stack: ["Next.js", "TypeScript", "Tremor", "Nivo", "Snowflake"],
        media: [{ label: "Shot 1 · Topsheet", src: "projects/aai-mfdb-1.png" }],
      },
      {
        slug: "model-deployment-framework",
        title: "Model Deployment Framework",
        badge: "Production",
        surface: "internal-dossier",
        role: "Frontend Engineer · Advance Auto Parts · Model Deployment Framework",
        lede: "Self-service ML model hosting dashboard — register, version, and deploy models without filing engineering tickets.",
        outcomes: [
          {
            label: "Self-serve",
            text: "Built the self-service ML model hosting dashboard (Next.js, TypeScript, Tailwind) enabling data scientists to register, version, and deploy models without filing engineering tickets",
          },
        ],
        artifacts: [
          {
            title: "What shipped",
            body: "Next.js, TypeScript, and Tailwind dashboard for data scientists to register, version, and deploy models.",
          },
        ],
        stack: ["Next.js", "TypeScript", "Tailwind CSS"],
        media: [
          { label: "Shot 1 · Home", src: "projects/aai-mdf-1.png" },
          { label: "Shot 2 · Services", src: "projects/aai-mdf-2.png" },
          { label: "Shot 3 · Jobs", src: "projects/aai-mdf-3.png" },
          { label: "Shot 4 · Notifications", src: "projects/aai-mdf-4.png" },
          { label: "Shot 5 · API Keys", src: "projects/aai-mdf-5.png" },
        ],
      },
      {
        slug: "store-dashboard",
        title: "Store Dashboard",
        badge: "Production",
        surface: "internal-dossier",
        role: "Frontend Engineer · Advance Auto Parts · Store Dashboard",
        lede: "Store-level performance and sales-forecast dashboard — actual vs predicted net sales for planning reviews.",
        outcomes: [
          {
            label: "Views",
            text: "Delivered store-level performance and sales-forecast views comparing actual vs predicted net sales across store segments for planning reviews",
          },
          {
            label: "Reach",
            text: "Streamlit + Snowflake SPA for regional leadership and store managers to analyze performance and identify outliers",
          },
        ],
        artifacts: [
          {
            title: "What shipped",
            body: "Streamlit + Snowflake SPA for regional leadership and store managers to analyze performance and identify outliers.",
          },
        ],
        stack: ["Streamlit", "Snowflake", "Python"],
        media: [
          { label: "Shot 1 · Performance", src: "projects/aai-store-dashboard-1.png" },
          { label: "Shot 2 · Forecast", src: "projects/aai-store-dashboard-2.png" },
          { label: "Shot 3 · What-if", src: "projects/aai-store-dashboard-3.png" },
        ],
      },
    ],
  },
  {
    slug: "prototypes",
    title: "Prototypes",
    framing: "Prototypes · Solo · public demos",
    cases: [
      {
        slug: "supplychain-plus",
        title: "SupplyChain+",
        badge: "Prototype",
        surface: "public-storefront",
        live: "https://sc-plus.vercel.app",
        role: "SupplyChain+ · solo build",
        lede: "A tool that scores supplier risk, groups complaints, and pulls evidence together for audits.",
        outcomes: [
          {
            label: "Craft",
            text: "Explainable supplier-risk scoring, complaint clustering, and compliance/reporting workflows with audit-oriented evidence export",
          },
          {
            label: "AI",
            text: "Multi-provider LLM tools for summarization, sentiment analysis, and audit-oriented evidence export",
          },
        ],
        stack: ["Next.js 16", "React 19", "PostgreSQL/pgvector", "Drizzle ORM", "Vercel AI SDK"],
        media: [
          { label: "Shot 1 · Home", src: "work/supplychain-plus/home.png" },
          { label: "Shot 2 · Diagnosis", src: "work/supplychain-plus/diagnosis.png" },
          { label: "Shot 3 · Audit", src: "work/supplychain-plus/audit.png" },
        ],
      },
      {
        slug: "qgenai",
        title: "QGenAI",
        badge: "Prototype",
        surface: "public-storefront",
        live: "https://qgenai.vercel.app",
        role: "QGenAI · solo build",
        lede: "A survey builder that turns a prompt into multi-type questions, with per-question regeneration and multi-language translation.",
        outcomes: [
          {
            label: "Builder",
            text: "Prompt-to-survey UI with multi-type questions, per-question AI regeneration, and multi-language translation",
          },
          {
            label: "AI",
            text: "Provider-agnostic AI layer (Google GenAI, OpenRouter, LM Studio) with client-side persistence and structured validation",
          },
        ],
        stack: ["Next.js 15", "React 19", "Vercel AI SDK", "Zod", "shadcn/ui", "IndexedDB"],
        media: [
          { label: "Shot 1 · Builder", src: "work/qgenai/builder.png" },
          { label: "Shot 2 · Survey", src: "work/qgenai/survey.png" },
          { label: "Shot 3 · Translate", src: "work/qgenai/translate.png" },
        ],
      },
    ],
  },
  {
    slug: "tools",
    title: "Tools",
    framing: "Tools · Solo · browser-local utilities",
    cases: [
      {
        slug: "snap2paper",
        title: "Snap2Paper",
        badge: "Production",
        surface: "public-storefront",
        live: "https://mcq.vishalk.com/",
        role: "Snap2Paper · solo build",
        lede: "A study-sheet digitizer that scans paper questions into editable MCQ study sets with local-only storage.",
        outcomes: [
          {
            label: "Scan",
            text: "Gemini vision turns paper study sheets into editable MCQ collections you can review and print",
          },
          {
            label: "Print",
            text: "Client-side print preview and PDF export with local-only data storage",
          },
        ],
        stack: ["TypeScript", "Gemini", "html2canvas", "jsPDF"],
        media: [
          { label: "Shot 1 · Library", src: "work/snap2paper/library.png" },
          { label: "Shot 2 · Scan", src: "work/snap2paper/scan.png" },
          { label: "Shot 3 · Print", src: "work/snap2paper/print.png" },
        ],
      },
      {
        slug: "photogrid",
        title: "PhotoGrid",
        badge: "Production",
        surface: "public-storefront",
        live: "https://printgrid.vishalk.com/",
        role: "PhotoGrid · solo build",
        lede: "A passport and wallet photo layout tool — arrange uploaded photos onto standard paper sizes with cutting guides.",
        outcomes: [
          {
            label: "Layout",
            text: "Layout uploaded photos onto A4 and photo papers for passport, wallet, and stamp sizes",
          },
          {
            label: "Print",
            text: "Client-side print PDF export with live preview, margins, spacing, and optional cutting guides",
          },
        ],
        stack: ["TypeScript", "Canvas", "Client-side PDF"],
        media: [
          { label: "Shot 1 · Layout", src: "work/photogrid/layout.png" },
          { label: "Shot 2 · Sizes", src: "work/photogrid/sizes.png" },
          { label: "Shot 3 · Print", src: "work/photogrid/print.png" },
        ],
      },
      {
        slug: "pdfgrid",
        title: "PDFGrid",
        badge: "Production",
        surface: "public-storefront",
        live: "https://pdfgrid.vishalk.com/",
        role: "PDFGrid · solo build",
        lede: "A browser tool that arranges uploaded PDFs into printable grid layouts.",
        outcomes: [
          {
            label: "Layout",
            text: "Printable grid layouts for A4 and Letter with configurable columns, rows, margins, and gaps",
          },
          {
            label: "Compile",
            text: "Browser-local PDF compile — upload documents, preview the grid, and generate a print-ready PDF on-device",
          },
        ],
        stack: ["TypeScript", "PDF", "Client-side layout"],
        media: [
          { label: "Shot 1 · Grid", src: "work/pdfgrid/grid.png" },
          { label: "Shot 2 · Preview", src: "work/pdfgrid/preview.png" },
          { label: "Shot 3 · Export", src: "work/pdfgrid/export.png" },
        ],
      },
    ],
  },
];

/** Work-root dense outcome index (All work). */
export function workRootHref(): string {
  return "/work";
}

export function workCaseHref(folderSlug: string, caseSlug: string): string {
  return `/work/${folderSlug}/${caseSlug}`;
}

export function getWorkFolder(folderSlug: string): WorkFolder | undefined {
  return WORK_FOLDERS.find((folder) => folder.slug === folderSlug);
}

export function getWorkCase(folderSlug: string, caseSlug: string): WorkCase | undefined {
  return getWorkFolder(folderSlug)?.cases.find((entry) => entry.slug === caseSlug);
}

/** Resolve the active Work Case from a pathname (`/work/<folder>/<case>`). */
export function getWorkCaseFromPath(pathname: string): WorkCase | undefined {
  const match = pathname.match(/^\/work\/([^/]+)\/([^/]+)\/?$/);
  if (!match) return undefined;
  return getWorkCase(match[1], match[2]);
}

export function isHttpLiveUrl(live: string | undefined): live is string {
  return Boolean(live && /^https?:\/\//i.test(live));
}

/** Live URL when the case is a Public Storefront; Internal Dossiers never expose Live. */
export function workCaseLiveUrl(workCase: WorkCase): string | undefined {
  return workCase.surface === "public-storefront" ? workCase.live : undefined;
}

export function asInternalDossier(workCase: WorkCase): InternalDossierCase | undefined {
  return workCase.surface === "internal-dossier" ? workCase : undefined;
}

export function asPublicStorefront(workCase: WorkCase): PublicStorefrontCase | undefined {
  return workCase.surface === "public-storefront" ? workCase : undefined;
}
