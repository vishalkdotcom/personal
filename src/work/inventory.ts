/** Locked v1 Work inventory — folders, cases, badges. Omitted cases stay out. */

export type WorkBadge = "Production" | "Prototype";

export type WorkSurface = "public-storefront" | "internal-dossier";

export type WorkCase = {
  slug: string;
  title: string;
  badge: WorkBadge;
  surface: WorkSurface;
  /** Context Rail Live line — honest URL or auth-walled note. */
  live: string;
  /** Context Rail Role stub — richer copy in later case tickets. */
  role: string;
  /** Context Rail Outcomes stubs — Public Claims only when filled. */
  outcomes: string[];
  /** Context Rail Stack — always shown expanded. */
  stack: string[];
};

export type WorkFolder = {
  slug: string;
  title: string;
  cases: WorkCase[];
};

const dossierLive = "Auth-walled · no public URL";
const publicLive = "Public URL (stub)";

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
        role: "Engage reporting · FE lead",
        outcomes: ["Engage reporting outcomes (stub)"],
        stack: ["Reporting UI", "TypeScript"],
      },
      {
        slug: "indicator-bank",
        title: "Indicator Bank",
        badge: "Production",
        surface: "internal-dossier",
        live: dossierLive,
        role: "Indicator Bank · FE",
        outcomes: ["Indicator Bank outcomes (stub)"],
        stack: ["React", "TypeScript"],
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
        role: "Measurement Framework · FE",
        outcomes: ["Measurement Framework outcomes (stub)"],
        stack: ["React", "Data viz"],
      },
      {
        slug: "model-deployment-framework",
        title: "Model Deployment Framework",
        badge: "Production",
        surface: "internal-dossier",
        live: dossierLive,
        role: "Model Deployment Framework · FE",
        outcomes: ["Model Deployment Framework outcomes (stub)"],
        stack: ["React", "TypeScript"],
      },
      {
        slug: "store-dashboard",
        title: "Store Dashboard",
        badge: "Production",
        surface: "internal-dossier",
        live: dossierLive,
        role: "Store Dashboard · FE",
        outcomes: ["Store Dashboard outcomes (stub)"],
        stack: ["React", "Dashboards"],
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
        live: publicLive,
        role: "SupplyChain+ · solo build",
        outcomes: ["SupplyChain+ outcomes (stub)"],
        stack: ["SolidJS", "Vite"],
      },
      {
        slug: "qgenai",
        title: "QGenAI",
        badge: "Prototype",
        surface: "public-storefront",
        live: publicLive,
        role: "QGenAI · solo build",
        outcomes: ["QGenAI outcomes (stub)"],
        stack: ["React", "AI UI"],
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
        live: publicLive,
        role: "Snap2Paper · solo build",
        outcomes: ["Snap2Paper outcomes (stub)"],
        stack: ["TypeScript", "Canvas"],
      },
      {
        slug: "photogrid",
        title: "PhotoGrid",
        badge: "Production",
        surface: "public-storefront",
        live: publicLive,
        role: "PhotoGrid · solo build",
        outcomes: ["PhotoGrid outcomes (stub)"],
        stack: ["TypeScript", "Images"],
      },
      {
        slug: "pdfgrid",
        title: "PDFGrid",
        badge: "Production",
        surface: "public-storefront",
        live: publicLive,
        role: "PDFGrid · solo build",
        outcomes: ["PDFGrid outcomes (stub)"],
        stack: ["TypeScript", "PDF"],
      },
    ],
  },
];

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

/** Resolve the active Work Case from a pathname (`/work/<folder>/<case>`). */
export function getWorkCaseFromPath(pathname: string): WorkCase | undefined {
  const match = pathname.match(/^\/work\/([^/]+)\/([^/]+)\/?$/);
  if (!match) return undefined;
  return getWorkCase(match[1], match[2]);
}
