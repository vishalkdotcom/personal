/** Locked About Mode copy from shell-round-9 D+A (pitch + skills · Availability + Facts + Elsewhere). */

export type AboutFact = {
  label: string;
  value: string;
};

export type AboutElsewhereLink = {
  label: string;
  href: string;
  external?: boolean;
};

/**
 * Curated Selected work peek — inventory case + short About-only blurb.
 * Quiet meta is derived at join time (Prototype badge vs Work Folder title).
 */
export type AboutSelectedWorkPeek = {
  folderSlug: string;
  caseSlug: string;
  blurb: string;
};

export const ABOUT_NAME = "Vishal Kumar";

export const ABOUT_META =
  "Senior Frontend Engineer · React / Next.js · Complex product UI (reporting, forms, platform)";

export const ABOUT_PITCH =
  "7+ years building complex React/Next.js product UI for remote teams — 13+ years total. Reporting surfaces, form/admin workflows, and platform cleanup. AI-native delivery; all output reviewed, tested, and owned.";

export const ABOUT_SKILLS = [
  "Next.js",
  "React",
  "TypeScript",
  "JavaScript",
  "Figma",
  "Metabase",
  "Playwright",
] as const;

/**
 * Locked densify trio (about-densify-locked). Swap only among inventory cases.
 */
export const ABOUT_SELECTED_WORK: readonly AboutSelectedWorkPeek[] = [
  {
    folderSlug: "prototypes",
    caseSlug: "supplychain-plus",
    blurb: "Supplier-risk scoring you can open.",
  },
  {
    folderSlug: "labor-solutions",
    caseSlug: "engage-reporting",
    blurb: "Embeds, risk maps, export parity.",
  },
  {
    folderSlug: "advance-auto-parts",
    caseSlug: "measurement-framework",
    blurb: "Store KPI trends and drill-downs.",
  },
];

export const HIRE_SIGNAL_DETAIL = "Senior Frontend · Complex product UI · remote";

export const ABOUT_AVAILABILITY = `Open to roles · ${HIRE_SIGNAL_DETAIL}`;

/** Left-chrome foot + Facts “Based” — one shared location string. */
export const BASED_LOCATION = "Punjab · remote";

export const ABOUT_FACTS: AboutFact[] = [
  { label: "Based", value: BASED_LOCATION },
  { label: "Experience", value: "13+ yrs" },
  { label: "Focus", value: "Complex product UI" },
];

export const ABOUT_ELSEWHERE: AboutElsewhereLink[] = [
  { label: "Resume (PDF) →", href: "/resume" },
  {
    label: "LinkedIn →",
    href: "https://www.linkedin.com/in/vishalkdotcom",
    external: true,
  },
  {
    label: "GitHub →",
    href: "https://github.com/vishalkdotcom",
    external: true,
  },
];
