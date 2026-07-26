/** Resume Surface: PDF is source of truth (no HTML CV rebuild). */

import { ABOUT_AVAILABILITY, ABOUT_ELSEWHERE, type AboutElsewhereLink } from "../about/content";

export const RESUME_PDF_HREF = "/vishal-cv.pdf";

/** Display filename for the shell-owned Resume viewer toolbar. */
export const RESUME_PDF_FILENAME = RESUME_PDF_HREF.slice(RESUME_PDF_HREF.lastIndexOf("/") + 1);

export const RESUME_PDF_TITLE = "Vishal Kumar resume";

/** Shared Hire Signal Availability body (same as About). */
export const RESUME_AVAILABILITY = ABOUT_AVAILABILITY;

export type ResumeLink = AboutElsewhereLink;

/** Thin Context Rail links: PDF download + About elsewhere (minus Mode deep link). */
export const RESUME_LINKS: ResumeLink[] = [
  { label: "Download PDF →", href: RESUME_PDF_HREF },
  ...ABOUT_ELSEWHERE.filter((link) => link.href !== "/resume"),
];
