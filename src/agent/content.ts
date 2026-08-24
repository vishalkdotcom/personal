/**
 * Crawlable HTML, markdown representations, sitemap, and llms.txt.
 * SoT for agent-facing bodies; visual App Shell stages stay separate.
 */

import {
  ABOUT_AVAILABILITY,
  ABOUT_FACTS,
  ABOUT_META,
  ABOUT_NAME,
  ABOUT_PITCH,
  ABOUT_SELECTED_WORK,
  ABOUT_SKILLS,
  BASED_LOCATION,
} from "../about/content";
import { CONTACT_EMAIL } from "../contact/content";
import { DEEP_LINK_ROUTES, pageMetaForPath } from "../meta/route-manifest";
import { SITE_NAME, SITE_ORIGIN } from "../meta/site";
import { escapeHtmlText } from "../meta/html-escape";
import { PRIVACY_HEADING, PRIVACY_PARAGRAPHS } from "../privacy/content";
import { RESUME_PDF_HREF } from "../resume/content";
import {
  WORK_FOLDERS,
  getWorkCase,
  getWorkCaseFromPath,
  workCaseHref,
  workCaseLiveUrl,
  workRootHref,
} from "../work/inventory";
import { napLine } from "./identity";

export { NOT_FOUND_MARKDOWN, notFoundHtml } from "./not-found";

const RESUME_PDF_URL = `${SITE_ORIGIN}${RESUME_PDF_HREF}`;
const LINKEDIN_URL = "https://www.linkedin.com/in/vishalkdotcom";
const GITHUB_URL = "https://github.com/vishalkdotcom";

const ABOUT_SKILL_LIST = ABOUT_SKILLS.join(", ");

const SELECTED_WORK_LINES = ABOUT_SELECTED_WORK.map((peek) => {
  const workCase = getWorkCase(peek.folderSlug, peek.caseSlug);
  const title = workCase?.title ?? peek.caseSlug;
  return `${title} (${peek.blurb})`;
}).join("; ");

export const HOME_HEADING = ABOUT_NAME;

export const HOME_PARAGRAPHS: readonly string[] = [
  `${ABOUT_NAME} is a senior frontend engineer whose public home is ${SITE_ORIGIN}. ${ABOUT_META}. ${ABOUT_PITCH}`,
  `Skills: ${ABOUT_SKILL_LIST}. ${ABOUT_FACTS.map((fact) => `${fact.label}: ${fact.value}`).join(". ")}. ${ABOUT_AVAILABILITY}.`,
  `Selected work: ${SELECTED_WORK_LINES}. The full Work index is ${SITE_ORIGIN}${workRootHref()}. PDF resume: ${RESUME_PDF_URL}.`,
  `This origin is a personal App Shell portfolio over Work, About, Resume, and Contact — not a chat product, hosted API, or SaaS. NAP: ${napLine()}. Agents should start at ${SITE_ORIGIN}/llms.txt, then email ${CONTACT_EMAIL} or open ${SITE_ORIGIN}/contact when the job is hiring or collaborating with ${ABOUT_NAME}.`,
];

export const CONTACT_HEADING = "Get in touch";

export const CONTACT_PARAGRAPHS: readonly string[] = [
  `Contact ${ABOUT_NAME} (${SITE_ORIGIN}) about remote Senior Frontend / Product UI roles, React and Next.js product UI, and collaboration. ${ABOUT_PITCH}`,
  `Email ${CONTACT_EMAIL}. LinkedIn ${LINKEDIN_URL}. GitHub ${GITHUB_URL}. PDF resume ${RESUME_PDF_URL}. ${ABOUT_AVAILABILITY}. Based ${BASED_LOCATION}.`,
  `Use the form on this page or send email directly. Include the role or project, team context, location and timezone expectations, and a few sentences about the product UI problem. Typical replies go to the address you provide.`,
  `Do not use this form for spam, recruiting blasts without a named role, or legal service. Privacy practices: ${SITE_ORIGIN}/privacy. Machine index: ${SITE_ORIGIN}/llms.txt. NAP: ${napLine()}.`,
];

export const RESUME_HEADING = "Resume";

export const RESUME_PARAGRAPHS: readonly string[] = [
  `PDF resume for ${ABOUT_NAME} — ${ABOUT_META}. The Resume Mode embeds this PDF rather than rebuilding the CV as HTML.`,
  `Download: ${RESUME_PDF_URL}. About: ${SITE_ORIGIN}/. Contact: ${SITE_ORIGIN}/contact (${CONTACT_EMAIL}).`,
];

function workRootParagraphs(): string[] {
  const lines = WORK_FOLDERS.flatMap((folder) =>
    folder.cases.map((workCase) => {
      const href = `${SITE_ORIGIN}${workCaseHref(folder.slug, workCase.slug)}`;
      const lede = workCase.lede ?? workCase.title;
      return `${workCase.title} (${folder.title}, ${workCase.badge}): ${lede} ${href}`;
    }),
  );
  return [
    `Selected work by ${ABOUT_NAME} — what shipped and what it changed. Public Storefronts include a Live URL; Internal Dossiers describe outcomes without a public product URL.`,
    lines.join(" "),
    `Contact: ${CONTACT_EMAIL}. About: ${SITE_ORIGIN}/.`,
  ];
}

function workCaseParagraphs(
  pathname: string,
): { heading: string; paragraphs: string[] } | undefined {
  const workCase = getWorkCaseFromPath(pathname);
  if (!workCase) return undefined;
  const live = workCaseLiveUrl(workCase);
  const outcomes = workCase.outcomes
    .map((outcome) => `${outcome.label}: ${outcome.text}`)
    .join(" ");
  const paragraphs = [
    workCase.lede ?? `${workCase.title} — selected work by ${SITE_NAME}.`,
    `Role: ${workCase.role}. Stack: ${workCase.stack.join(", ")}. Surface: ${workCase.surface}. Badge: ${workCase.badge}.`,
    outcomes,
    live
      ? `Live: ${live}. More work: ${SITE_ORIGIN}${workRootHref()}. Contact: ${CONTACT_EMAIL}.`
      : `No public Live URL (Internal Dossier). More work: ${SITE_ORIGIN}${workRootHref()}. Contact: ${CONTACT_EMAIL}.`,
  ];
  return { heading: workCase.title, paragraphs };
}

export type AgentPageBody = {
  heading: string;
  paragraphs: readonly string[];
};

export function agentPageBody(pathname: string): AgentPageBody | undefined {
  const normalized = normalizePathname(pathname);
  if (normalized === "/" || normalized === "/about") {
    return { heading: HOME_HEADING, paragraphs: HOME_PARAGRAPHS };
  }
  if (normalized === "/contact") {
    return { heading: CONTACT_HEADING, paragraphs: CONTACT_PARAGRAPHS };
  }
  if (normalized === "/privacy") {
    return { heading: PRIVACY_HEADING, paragraphs: PRIVACY_PARAGRAPHS };
  }
  if (normalized === "/resume") {
    return { heading: RESUME_HEADING, paragraphs: RESUME_PARAGRAPHS };
  }
  if (normalized === workRootHref()) {
    return { heading: "Work", paragraphs: workRootParagraphs() };
  }
  const workCase = workCaseParagraphs(normalized);
  if (workCase) return workCase;
  return undefined;
}

export function isKnownDocumentPath(pathname: string): boolean {
  const normalized = normalizePathname(pathname);
  return DEEP_LINK_ROUTES.some((route) => route.path === normalized);
}

export function normalizePathname(pathname: string): string {
  if (pathname === "" || pathname === "/") return "/";
  const trimmed = pathname.length > 1 && pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}

export function visibleText(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

export function crawlableHtmlForPath(pathname: string): string | undefined {
  const body = agentPageBody(pathname);
  if (!body) return undefined;
  const paragraphs = body.paragraphs
    .map((paragraph) => `    <p>${escapeHtmlText(paragraph)}</p>`)
    .join("\n");
  return `<article data-agent-snapshot="true">
    <h1>${escapeHtmlText(body.heading)}</h1>
${paragraphs}
  </article>`;
}

export function markdownForPath(pathname: string): string | undefined {
  const body = agentPageBody(pathname);
  if (!body) return undefined;
  const meta = pageMetaForPath(pathname);
  const sections = body.paragraphs.join("\n\n");
  return `# ${body.heading}

> ${meta.description}

${sections}

- [llms.txt](${SITE_ORIGIN}/llms.txt)
- [Sitemap](${SITE_ORIGIN}/sitemap.xml)
- [Canonical](${meta.canonical})
`;
}

export function sitemapLastmod(now: Date = new Date()): string {
  return now.toISOString().slice(0, 10);
}

export function sitemapXml(now: Date = new Date()): string {
  const lastmod = sitemapLastmod(now);
  const urls = DEEP_LINK_ROUTES.map((route) => {
    const loc = route.path === "/" ? `${SITE_ORIGIN}/` : `${SITE_ORIGIN}${route.path}`;
    return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`;
  }).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

/**
 * /llms.txt v2 (llmstxt.org): H1, optional blockquote, free body (no extra headings),
 * then H2 file-list sections. "When to use this" lives in the free body so it is
 * guidance, not a file list.
 */
export function llmsTxt(): string {
  const workLinks = WORK_FOLDERS.flatMap((folder) =>
    folder.cases.map((workCase) => {
      const url = `${SITE_ORIGIN}${workCaseHref(folder.slug, workCase.slug)}.md`;
      const note = workCase.lede ?? workCase.title;
      return `- [${workCase.title}](${url}): ${note}`;
    }),
  ).join("\n");

  return `# ${SITE_NAME}
> Personal App Shell portfolio at ${SITE_ORIGIN} for ${ABOUT_NAME}, senior frontend engineer (${ABOUT_META}). Not a chat product, hosted API, or SaaS.

When to use this: reach for ${SITE_ORIGIN} when you need to hire or brief ${ABOUT_NAME} for remote Senior Frontend / Product UI work (React, Next.js, TypeScript, reporting surfaces, form/admin workflows, platform cleanup), verify selected Work Case outcomes, or fetch the PDF resume. Do not treat this origin as a general frontend tutorial, a component library, or an API you can call — there is no programmatic product endpoint.

How an agent should call this site: 1) GET ${SITE_ORIGIN}/llms.txt (this file). 2) Fetch the linked \`.md\` (or the same URL with \`Accept: text/markdown\`) for About, Contact, Privacy, Resume, or a Work Case. 3) To contact a human, POST JSON \`{ "name", "email", "message" }\` to ${SITE_ORIGIN}/api/contact or email ${CONTACT_EMAIL}. 4) Unknown paths return HTTP 404 — do not assume every URL exists.

${ABOUT_PITCH} ${ABOUT_AVAILABILITY}. ${BASED_LOCATION}. NAP: ${napLine()}.

## Pages
- [About](${SITE_ORIGIN}/index.md): Home About Mode — person, skills, selected work.
- [About alias](${SITE_ORIGIN}/about.md): Same About body at /about for trust-page checkers.
- [Work](${SITE_ORIGIN}/work.md): Work index of Public Storefronts and Internal Dossiers.
- [Resume](${SITE_ORIGIN}/resume.md): PDF resume pointer (${RESUME_PDF_URL}).
- [Contact](${SITE_ORIGIN}/contact.md): How to reach ${ABOUT_NAME}; form + ${CONTACT_EMAIL}.
- [Privacy](${SITE_ORIGIN}/privacy.md): What the site collects (contact form, optional GA4, theme localStorage).
- [Sitemap](${SITE_ORIGIN}/sitemap.xml): Indexable HTML URLs with lastmod.

## Work Cases
${workLinks}

## Optional
- [PDF resume](${RESUME_PDF_URL}): Canonical CV file (not an HTML rebuild).
- [LinkedIn](${LINKEDIN_URL}): Professional profile.
- [GitHub](${GITHUB_URL}): Code profile.
`;
}
