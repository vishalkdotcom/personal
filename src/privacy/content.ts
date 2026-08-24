/** Privacy page copy — SoT for the App Shell stage, crawlable HTML, and markdown. */

import { CONTACT_EMAIL } from "../contact/content";
import { SITE_NAME, SITE_ORIGIN } from "../meta/site";

export const PRIVACY_TITLE = "Privacy";

export const PRIVACY_HEADING = "Privacy";

export const PRIVACY_INTRO = `${SITE_NAME} operates ${SITE_ORIGIN} as a personal portfolio. This page explains what the site collects, why, and how to reach the owner about it.`;

export const PRIVACY_PARAGRAPHS: readonly string[] = [
  PRIVACY_INTRO,
  `The public App Shell (Work, About, Resume, Contact) is static. Theme preference is stored in your browser under the localStorage key vk-theme. That value never leaves your device and is not a cookie.`,
  `The contact form on ${SITE_ORIGIN}/contact collects your name, email address, and message so ${SITE_NAME} can reply. Submissions are emailed through Resend to ${CONTACT_EMAIL}. They are not sold, rented, or used for advertising. Keep a copy of anything you send; inbox retention follows ordinary email practice.`,
  `Production pages may load Google Analytics 4 to count visits. GA4 uses first-party measurement cookies and similar storage as described in Google’s documentation. Analytics is measurement-only — it is not used to build a marketing profile or to sell data. Disable it with a browser tracker blocker if you prefer not to be counted.`,
  `Resume PDF, fonts, and work screenshots are static files. They are not personalized. Embedded Work Case media is the same for every visitor.`,
  `The site does not require an account, does not run ads, and does not use the contact form for newsletters. LinkedIn and GitHub links leave this origin and follow those services’ policies.`,
  `Questions or deletion requests: email ${CONTACT_EMAIL} with “Privacy” in the subject. This personal site has no phone contact point. Based in Punjab, India · Remote.`,
];

export const PRIVACY_BODY = PRIVACY_PARAGRAPHS.join("\n\n");
