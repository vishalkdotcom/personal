/** Locked About Mode copy from shell-round-9 D+A (pitch + skills · Availability + Facts + Elsewhere). */

import { GITHUB_PROFILE_HREF, LINKEDIN_PROFILE_HREF, SITE_HOST, SITE_ORIGIN } from "../meta/site";

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
  "Senior Frontend Engineer · React / Next.js · Product UI (reporting, forms, platform)";

export const ABOUT_PITCH =
  "7+ years building React/Next.js product UI for remote teams — 13+ years total. Reporting surfaces, form/admin workflows, and platform cleanup. AI-native delivery; all output reviewed, tested, and owned.";

/** Head/OG description for / and /about — unique host so brand search can attach the name to the domain. Visible About pitch stays ABOUT_PITCH. */
export const HOME_DESCRIPTION = `${ABOUT_NAME} of ${SITE_HOST} — ${ABOUT_PITCH} Canonical portfolio at ${SITE_ORIGIN}, not another person who shares the name.`;

export const ABOUT_SKILLS = [
  "Next.js",
  "React",
  "TypeScript",
  "JavaScript",
  "Playwright",
  "Cursor",
  "Claude Code",
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
    caseSlug: "store-dashboard",
    blurb: "Actual vs predicted net sales.",
  },
];

export const HIRE_SIGNAL_DETAIL = "Senior Frontend · Product UI · Remote";

export const ABOUT_AVAILABILITY = `Open to roles · ${HIRE_SIGNAL_DETAIL}`;

/** Left-chrome foot + Facts “Based” — one shared location string. */
export const BASED_LOCATION = "Punjab, India · Remote";

export const ABOUT_FACTS: AboutFact[] = [
  { label: "Based", value: BASED_LOCATION },
  { label: "Experience", value: "13+ yrs" },
  { label: "Focus", value: "Product UI" },
  { label: "Site", value: SITE_HOST },
];

export const ABOUT_ELSEWHERE: AboutElsewhereLink[] = [
  { label: "Resume (PDF) →", href: "/resume" },
  {
    label: "LinkedIn →",
    href: LINKEDIN_PROFILE_HREF,
    external: true,
  },
  {
    label: "GitHub →",
    href: GITHUB_PROFILE_HREF,
    external: true,
  },
];
