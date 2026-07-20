/** Contact Mode Context Rail: availability + email / LinkedIn / GitHub / CV. */

import { ABOUT_AVAILABILITY, ABOUT_ELSEWHERE, type AboutElsewhereLink } from "../about/content";
import { RESUME_PDF_HREF } from "../resume/content";

export const CONTACT_EMAIL = "hello@vishalk.com";

export const CONTACT_AVAILABILITY = ABOUT_AVAILABILITY;

/** Quick links stay available even when Hire Signal is off (no hire-flag gate). */
export const CONTACT_QUICK_LINKS: AboutElsewhereLink[] = [
  { label: "Email →", href: `mailto:${CONTACT_EMAIL}` },
  ...ABOUT_ELSEWHERE.filter(
    (link) =>
      link.href === "https://www.linkedin.com/in/vishalkdotcom" ||
      link.href === "https://github.com/vishalkdotcom",
  ),
  { label: "CV →", href: RESUME_PDF_HREF },
];
