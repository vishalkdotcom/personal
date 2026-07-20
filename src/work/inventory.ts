/** Locked v1 Work inventory — folders, cases, badges. Omitted cases stay out. */

export type WorkBadge = "Production" | "Prototype";

export type WorkSurface = "public-storefront" | "internal-dossier";

export type WorkCase = {
  slug: string;
  title: string;
  badge: WorkBadge;
  surface: WorkSurface;
};

export type WorkFolder = {
  slug: string;
  title: string;
  cases: WorkCase[];
};

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
      },
      {
        slug: "indicator-bank",
        title: "Indicator Bank",
        badge: "Production",
        surface: "internal-dossier",
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
      },
      {
        slug: "model-deployment-framework",
        title: "Model Deployment Framework",
        badge: "Production",
        surface: "internal-dossier",
      },
      {
        slug: "store-dashboard",
        title: "Store Dashboard",
        badge: "Production",
        surface: "internal-dossier",
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
      },
      {
        slug: "qgenai",
        title: "QGenAI",
        badge: "Prototype",
        surface: "public-storefront",
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
      },
      {
        slug: "photogrid",
        title: "PhotoGrid",
        badge: "Production",
        surface: "public-storefront",
      },
      {
        slug: "pdfgrid",
        title: "PDFGrid",
        badge: "Production",
        surface: "public-storefront",
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
