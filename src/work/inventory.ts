/** Locked v1 Work inventory — folders, cases, badges. Omitted cases stay out. */

export type WorkBadge = "Production" | "Prototype";

export type WorkSurface = "public-storefront" | "internal-dossier";

/** Stage carousel slide — label required; src optional until screenshot assets land. */
export type WorkMediaSlide = {
  label: string;
  src?: string;
};

export type WorkCase = {
  slug: string;
  title: string;
  badge: WorkBadge;
  surface: WorkSurface;
  /** Context Rail Live line — honest URL or auth-walled note. */
  live: string;
  /** Context Rail Role stub — richer copy in later case tickets. */
  role: string;
  /** Center + Context Rail Outcomes — Public Claims only when filled. */
  outcomes: string[];
  /** Context Rail Stack — always shown expanded. */
  stack: string[];
  /**
   * Proof-first stage lede (Public Claims only).
   * When set, the case narrative ships instead of a stub.
   */
  lede?: string;
  /** Public Storefront stage carousel slides (placeholders OK). */
  media?: WorkMediaSlide[];
};

export type WorkFolder = {
  slug: string;
  title: string;
  cases: WorkCase[];
};

const dossierLive = "Auth-walled · no public URL";

export const WORK_FOLDERS: WorkFolder[] = [
  {
    slug: "labor-solutions",
    title: "Labor Solutions",
    cases: [
      {
        slug: "engage-reporting",
        title: "Engage reporting",
        badge: "Production",
        surface: "internal-dossier",
        live: dossierLive,
        role: "Senior Frontend Developer · Labor Solutions · PIC on Engage reporting OKR",
        lede: "Auth-walled Engage questionnaire reporting — Summary, Categories, and Miscellaneous with Metabase embeds, risk maps, and dashboard/export score parity. No public demo URL.",
        outcomes: [
          "Problem → solution: dashboard vs Excel score drift — facility-first vs question-first aggregations diverged; exports aligned to analytics cards as the single scoring authority",
          "Reporting artifacts shipped in-product: Summary, Categories, and Miscellaneous with Metabase embeds, risk indicators, geographic/category risk maps, and top/bottom sites",
        ],
        stack: ["React", "Next.js", "TypeScript", "Metabase Embedding SDK", "Redux Toolkit"],
        media: [
          { label: "Shot 1 · Shell" },
          { label: "Shot 2 · Summary" },
          { label: "Shot 3 · eNPS" },
          { label: "Shot 4 · Question results" },
          { label: "Shot 5 · Overall table" },
        ],
      },
      {
        slug: "indicator-bank",
        title: "Indicator Bank",
        badge: "Production",
        surface: "internal-dossier",
        live: dossierLive,
        role: "Senior Frontend Developer · Labor Solutions · Indicator Bank platform",
        lede: "Auth-walled multilingual Indicator Bank — reusable questions and answer sets across Django and Next.js with protected Excel import/export and survey association. No public demo URL.",
        outcomes: [
          "Built a multilingual Indicator Bank across Django and Next.js — reusable questions/answer sets and four administration surfaces (Indicators, Questions, Answer Sets, Manage Associations)",
          "Protected Excel import/export with partial-success validation, soft deletion, and idempotent survey association for reusable survey content",
        ],
        stack: ["Django", "Next.js", "React", "TypeScript", "Excel import/export"],
        media: [
          { label: "Shot 1 · Indicators" },
          { label: "Shot 2 · Questions" },
          { label: "Shot 3 · Answer Sets" },
          { label: "Shot 4 · Associations" },
        ],
      },
    ],
  },
  {
    slug: "advance-auto-parts",
    title: "Advance Auto Parts",
    cases: [
      {
        slug: "measurement-framework",
        title: "Measurement Framework",
        badge: "Production",
        surface: "internal-dossier",
        live: dossierLive,
        role: "Frontend Engineer · Advance Auto Parts · Measurement Framework",
        lede: "Auth-walled store KPI measurement UI — trends, filters, and drill-downs for operational and leadership stakeholders. No public demo URL.",
        outcomes: [
          "Built the store KPI measurement UI (Next.js, Tremor/Nivo, TypeScript, Snowflake) serving operational and leadership stakeholders with trends, filters, and drill-down views",
          "Interactive monitoring of key metrics and business performance with trend analysis across time intervals",
        ],
        stack: ["Next.js", "TypeScript", "Tremor", "Nivo", "Snowflake"],
      },
      {
        slug: "model-deployment-framework",
        title: "Model Deployment Framework",
        badge: "Production",
        surface: "internal-dossier",
        live: dossierLive,
        role: "Frontend Engineer · Advance Auto Parts · Model Deployment Framework",
        lede: "Auth-walled self-service ML model hosting dashboard — register, version, and deploy models without filing engineering tickets. No public demo URL.",
        outcomes: [
          "Built the self-service ML model hosting dashboard (Next.js, TypeScript, Tailwind) enabling data scientists to register, version, and deploy models without filing engineering tickets",
          "Responsive platform for testing and deploying machine learning models from any device",
        ],
        stack: ["Next.js", "TypeScript", "Tailwind CSS"],
      },
      {
        slug: "store-dashboard",
        title: "Store Dashboard",
        badge: "Production",
        surface: "internal-dossier",
        live: dossierLive,
        role: "Frontend Engineer · Advance Auto Parts · Store Dashboard",
        lede: "Auth-walled store-level performance and sales-forecast dashboard — actual vs predicted net sales for planning reviews. No public demo URL.",
        outcomes: [
          "Delivered store-level performance and sales-forecast views comparing actual vs predicted net sales across store segments for planning reviews",
          "Streamlit + Snowflake SPA for regional leadership and store managers to analyze performance and identify outliers",
        ],
        stack: ["Streamlit", "Snowflake", "Python"],
      },
    ],
  },
  {
    slug: "prototypes",
    title: "Prototypes",
    cases: [
      {
        slug: "supplychain-plus",
        title: "SupplyChain+",
        badge: "Prototype",
        surface: "public-storefront",
        live: "https://sc-plus.vercel.app",
        role: "SupplyChain+ · solo build",
        lede: "AI supply-chain compliance prototype — explainable supplier-risk scoring, complaint clustering, and audit-oriented evidence export. Public deploy you can open.",
        outcomes: [
          "Portfolio demo of explainable supplier-risk scoring, complaint clustering, and compliance/reporting workflows — not a production launch",
          "Multi-provider LLM tools for summarization, sentiment analysis, and audit-oriented evidence export",
        ],
        stack: ["Next.js 16", "React 19", "PostgreSQL/pgvector", "Drizzle ORM", "Vercel AI SDK"],
        media: [
          { label: "Shot 1 · Home" },
          { label: "Shot 2 · Diagnosis" },
          { label: "Shot 3 · Audit" },
        ],
      },
      {
        slug: "qgenai",
        title: "QGenAI",
        badge: "Prototype",
        surface: "public-storefront",
        live: "https://qgenai.vercel.app",
        role: "QGenAI · solo build",
        lede: "AI survey builder prototype — prompt-to-survey UI with multi-type questions, per-question regeneration, and multi-language translation. Public deploy you can open.",
        outcomes: [
          "Prompt-to-survey UI with multi-type questions, per-question AI regeneration, and multi-language translation",
          "Provider-agnostic AI layer (Google GenAI, OpenRouter, LM Studio) with client-side persistence and structured validation",
        ],
        stack: ["Next.js 15", "React 19", "Vercel AI SDK", "Zod", "shadcn/ui", "IndexedDB"],
        media: [
          { label: "Shot 1 · Builder" },
          { label: "Shot 2 · Survey" },
          { label: "Shot 3 · Translate" },
        ],
      },
    ],
  },
  {
    slug: "tools",
    title: "Tools",
    cases: [
      {
        slug: "snap2paper",
        title: "Snap2Paper",
        badge: "Production",
        surface: "public-storefront",
        live: "https://mcq.vishalk.com/",
        role: "Snap2Paper · solo build",
        lede: "AI-powered study sheet digitizer — scan paper questions into editable MCQ study sets with local-only storage. Public tool you can open.",
        outcomes: [
          "Gemini vision turns paper study sheets into editable MCQ collections you can review and print",
          "Client-side print preview and PDF export with local-only data storage",
        ],
        stack: ["TypeScript", "Gemini", "html2canvas", "jsPDF"],
        media: [
          { label: "Shot 1 · Library" },
          { label: "Shot 2 · Scan" },
          { label: "Shot 3 · Print" },
        ],
      },
      {
        slug: "photogrid",
        title: "PhotoGrid",
        badge: "Production",
        surface: "public-storefront",
        live: "https://printgrid.vishalk.com/",
        role: "PhotoGrid · solo build",
        lede: "Passport and wallet photo layout tool — arrange uploaded photos onto standard paper sizes with cutting guides. Public tool you can open.",
        outcomes: [
          "Layout uploaded photos onto A4 and photo papers for passport, wallet, and stamp sizes",
          "Client-side print PDF export with live preview, margins, spacing, and optional cutting guides",
        ],
        stack: ["TypeScript", "Canvas", "Client-side PDF"],
        media: [
          { label: "Shot 1 · Layout" },
          { label: "Shot 2 · Sizes" },
          { label: "Shot 3 · Print" },
        ],
      },
      {
        slug: "pdfgrid",
        title: "PDFGrid",
        badge: "Production",
        surface: "public-storefront",
        live: "https://pdfgrid.vishalk.com/",
        role: "PDFGrid · solo build",
        lede: "Client-side N-Up PDF compiler — arrange uploaded PDFs into printable grid layouts. Public tool you can open.",
        outcomes: [
          "N-Up grid layouts for A4 and Letter with configurable columns, rows, margins, and gaps",
          "Browser-local PDF compile — upload documents, preview the grid, and generate a print-ready PDF on-device",
        ],
        stack: ["TypeScript", "PDF", "Client-side layout"],
        media: [
          { label: "Shot 1 · Grid" },
          { label: "Shot 2 · Preview" },
          { label: "Shot 3 · Export" },
        ],
      },
    ],
  },
];

/** Work-root dense outcome index (All work). */
export function workRootHref(): string {
  return "/work";
}

export function workFolderHref(folderSlug: string): string {
  return `/work/${folderSlug}`;
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

/** Featured Public Storefront on `/` — SupplyChain+. */
export const FEATURED_WORK = {
  folderSlug: "prototypes",
  caseSlug: "supplychain-plus",
} as const;

export function getFeaturedWorkCase(): WorkCase {
  const workCase = getWorkCase(FEATURED_WORK.folderSlug, FEATURED_WORK.caseSlug);
  if (!workCase) {
    throw new Error("Featured Work Case SupplyChain+ missing from inventory");
  }
  return workCase;
}

export function getFeaturedWorkFolder(): WorkFolder {
  const folder = getWorkFolder(FEATURED_WORK.folderSlug);
  if (!folder) {
    throw new Error("Featured Work Folder Prototypes missing from inventory");
  }
  return folder;
}

/** Resolve the active Work Case from a pathname (`/work/<folder>/<case>`). */
export function getWorkCaseFromPath(pathname: string): WorkCase | undefined {
  const match = pathname.match(/^\/work\/([^/]+)\/([^/]+)\/?$/);
  if (!match) return undefined;
  return getWorkCase(match[1], match[2]);
}

/** Active Work Case for stage + Context Rail, including featured `/`. */
export function getActiveWorkCaseFromPath(pathname: string): WorkCase | undefined {
  if (pathname === "/" || pathname === "") return getFeaturedWorkCase();
  return getWorkCaseFromPath(pathname);
}

export function isHttpLiveUrl(live: string): boolean {
  return /^https?:\/\//i.test(live);
}

/**
 * Desktop Preview header chip — Public Storefront with an honest HTTP Live URL only.
 * Stub Live lines and Internal Dossiers stay disabled.
 */
export function isPreviewEnabledForPath(pathname: string): boolean {
  const workCase = getActiveWorkCaseFromPath(pathname);
  return workCase?.surface === "public-storefront" && isHttpLiveUrl(workCase.live);
}
