/** Resume Surface: PDF is source of truth (no HTML CV rebuild). */

import { ABOUT_AVAILABILITY, ABOUT_ELSEWHERE, type AboutElsewhereLink } from "../about/content";

export const RESUME_PDF_HREF = "/vishal-cv.pdf";

export const RESUME_PDF_TITLE = "Vishal Kumar resume";

/** Same Hire Signal copy as About until the Hire Signal flag ticket. */
export const RESUME_AVAILABILITY = ABOUT_AVAILABILITY;

export type ResumeLink = AboutElsewhereLink;

/** Thin Context Rail links: PDF download + About elsewhere (minus Mode deep link). */
export const RESUME_LINKS: ResumeLink[] = [
  { label: "Download PDF →", href: RESUME_PDF_HREF },
  ...ABOUT_ELSEWHERE.filter((link) => link.href !== "/resume"),
];
