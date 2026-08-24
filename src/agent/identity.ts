/** Machine-readable identity for JSON-LD, NAP, and rel=me. */

import {
  ABOUT_ELSEWHERE,
  ABOUT_META,
  ABOUT_NAME,
  ABOUT_PITCH,
  BASED_LOCATION,
} from "../about/content";
import { CONTACT_EMAIL } from "../contact/content";
import { SITE_NAME, SITE_ORIGIN } from "../meta/site";

export const PERSON_ID = `${SITE_ORIGIN}/#person`;
export const ORGANIZATION_ID = `${SITE_ORIGIN}/#organization`;
export const WEBSITE_ID = `${SITE_ORIGIN}/#website`;

export const SAME_AS_URLS: string[] = ABOUT_ELSEWHERE.filter((link) => link.external).map(
  (link) => link.href,
);

export const POSTAL_ADDRESS = {
  "@type": "PostalAddress",
  addressLocality: "Punjab",
  addressRegion: "Punjab",
  addressCountry: "IN",
} as const;

export const CONTACT_POINT = {
  "@type": "ContactPoint",
  email: CONTACT_EMAIL,
  url: `${SITE_ORIGIN}/contact`,
  contactType: "professional hiring",
  availableLanguage: "English",
  areaServed: "Worldwide",
} as const;

export function jsonLdGraph(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": PERSON_ID,
        name: ABOUT_NAME,
        alternateName: ["vishalk.com", `${SITE_NAME} · vishalk.com`],
        url: `${SITE_ORIGIN}/`,
        email: CONTACT_EMAIL,
        jobTitle: "Senior Frontend Engineer",
        description: `${ABOUT_PITCH} ${ABOUT_META}`,
        address: POSTAL_ADDRESS,
        sameAs: SAME_AS_URLS,
        worksFor: { "@id": ORGANIZATION_ID },
      },
      {
        "@type": "Organization",
        "@id": ORGANIZATION_ID,
        name: SITE_NAME,
        alternateName: "vishalk.com",
        url: `${SITE_ORIGIN}/`,
        email: CONTACT_EMAIL,
        description: ABOUT_PITCH,
        address: POSTAL_ADDRESS,
        contactPoint: CONTACT_POINT,
        founder: { "@id": PERSON_ID },
        sameAs: SAME_AS_URLS,
      },
      {
        "@type": "WebSite",
        "@id": WEBSITE_ID,
        name: SITE_NAME,
        alternateName: ["vishalk.com", `${SITE_NAME} portfolio`],
        url: `${SITE_ORIGIN}/`,
        description: ABOUT_PITCH,
        inLanguage: "en",
        publisher: { "@id": ORGANIZATION_ID },
        author: { "@id": PERSON_ID },
      },
    ],
  };
}

export function jsonLdScriptContent(): string {
  return JSON.stringify(jsonLdGraph()).replace(/</g, "\\u003c");
}

/** Human-readable NAP line used in crawlable copy. */
export function napLine(): string {
  return `${ABOUT_NAME}, ${BASED_LOCATION}, ${CONTACT_EMAIL}, ${SITE_ORIGIN}/`;
}
