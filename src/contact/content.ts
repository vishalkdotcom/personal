/** Contact Mode Context Rail: availability + email / LinkedIn / GitHub / CV. */

import { ABOUT_AVAILABILITY, ABOUT_ELSEWHERE, type AboutElsewhereLink } from "../about/content";
import { GITHUB_PROFILE_HREF, LINKEDIN_PROFILE_HREF } from "../meta/site";
import { RESUME_PDF_HREF } from "../resume/content";

export const CONTACT_EMAIL = "hello@vishalk.com";

export const CONTACT_AVAILABILITY = ABOUT_AVAILABILITY;

/** Quick links stay available even when Hire Signal is off (no hire-flag gate). */
export const CONTACT_QUICK_LINKS: AboutElsewhereLink[] = [
  { label: "Email →", href: `mailto:${CONTACT_EMAIL}` },
  ...ABOUT_ELSEWHERE.filter(
    (link) => link.href === LINKEDIN_PROFILE_HREF || link.href === GITHUB_PROFILE_HREF,
  ),
  { label: "CV →", href: RESUME_PDF_HREF },
];
