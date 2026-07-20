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

export const ABOUT_NAME = "Vishal Kumar";

export const ABOUT_META = "Senior Frontend Engineer · React / Next.js · Analytics & Reporting UIs";

export const ABOUT_PITCH =
  "7+ years on data-heavy reporting UIs for remote US/APAC teams — 13+ years total. Specialized in embedded BI, complex filters, and dashboard/export consistency.";

export const ABOUT_SKILLS = [
  "Next.js",
  "React",
  "TypeScript",
  "JavaScript",
  "Figma",
  "Metabase",
  "Playwright",
] as const;

export const ABOUT_AVAILABILITY =
  "Open to roles · Senior Frontend · reporting UIs · remote or hybrid";

export const ABOUT_FACTS: AboutFact[] = [
  { label: "Based", value: "Punjab · remote" },
  { label: "Experience", value: "13+ yrs" },
  { label: "Focus", value: "Reporting UIs" },
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
