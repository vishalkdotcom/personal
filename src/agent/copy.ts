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
import { SITE_ALTERNATE_NAMES, SITE_NAME, SITE_ORIGIN } from "../meta/site";
import { escapeHtmlText } from "../meta/stamp-meta-shell";
import { RESUME_PDF_HREF } from "../resume/content";
import {
  WORK_FOLDERS,
  getWorkCase,
  getWorkFolder,
  workCaseHref,
  workRootHref,
} from "../work/inventory";
import { markdownUrlForPath, normalizePathname } from "./paths";

export const LINKEDIN_HREF = "https://www.linkedin.com/in/vishalkdotcom";
export const GITHUB_HREF = "https://github.com/vishalkdotcom";

const SKILL_LIST = ABOUT_SKILLS.join(", ");
const FACT_LINE = ABOUT_FACTS.map((fact) => `${fact.label}: ${fact.value}`).join(" · ");

function selectedWorkBullets(): string[] {
  return ABOUT_SELECTED_WORK.map((peek) => {
    const workCase = getWorkCase(peek.folderSlug, peek.caseSlug);
    const title = workCase?.title ?? peek.caseSlug;
    const href = `${SITE_ORIGIN}${workCaseHref(peek.folderSlug, peek.caseSlug)}`;
    return `- [${title}](${href}): ${peek.blurb}`;
  });
}

function workIndexMarkdown(): string {
  const lines: string[] = [
    `# Work · ${SITE_NAME}`,
    "",
    "Selected work — what shipped and what it changed. Public storefronts have a live URL. Internal dossiers describe production systems that are not publicly clickable.",
    "",
  ];
  for (const folder of WORK_FOLDERS) {
    lines.push(`## ${folder.title}`, "", folder.framing, "");
    for (const workCase of folder.cases) {
      const href = `${SITE_ORIGIN}${workCaseHref(folder.slug, workCase.slug)}`;
      lines.push(
        `- [${workCase.title}](${href}) (${workCase.badge}): ${workCase.lede ?? workCase.role}`,
      );
    }
    lines.push("");
  }
  return `${lines.join("\n").trim()}\n`;
}

function workCaseMarkdown(pathname: string): string | undefined {
  const match = pathname.match(/^\/work\/([^/]+)\/([^/]+)$/);
  if (!match) return undefined;
  const folder = getWorkFolder(match[1]);
  const workCase = getWorkCase(match[1], match[2]);
  if (!folder || !workCase) return undefined;
  const lines = [
    `# ${workCase.title} · ${SITE_NAME}`,
    "",
    workCase.lede ?? `${workCase.title} — selected work by ${SITE_NAME}.`,
    "",
    `- Folder: ${folder.title}`,
    `- Role: ${workCase.role}`,
    `- Badge: ${workCase.badge}`,
    `- Stack: ${workCase.stack.join(", ")}`,
    "",
  ];
  if (workCase.outcomes.length > 0) {
    lines.push("## Outcomes", "");
    for (const outcome of workCase.outcomes) {
      lines.push(`- ${outcome.label}: ${outcome.text}`);
    }
    lines.push("");
  }
  lines.push(
    `Full site: ${SITE_ORIGIN}${workCaseHref(folder.slug, workCase.slug)}`,
    `Work index: ${SITE_ORIGIN}${workRootHref()}`,
    `Contact: ${SITE_ORIGIN}/contact`,
    "",
  );
  return lines.join("\n");
}

export function aboutMarkdown(): string {
  return [
    `# ${ABOUT_NAME}`,
    "",
    `> ${ABOUT_META}`,
    "",
    ABOUT_PITCH,
    "",
    `${ABOUT_NAME} is a senior frontend engineer for remote product teams. The public site at ${SITE_ORIGIN} is a portfolio App Shell — Work, About, Resume, and Contact — not a SaaS product, chatbot, or API platform.`,
    "",
    `Based ${BASED_LOCATION}. ${ABOUT_AVAILABILITY}. ${FACT_LINE}.`,
    "",
    "## Skills",
    "",
    SKILL_LIST,
    "",
    "## Selected work",
    "",
    ...selectedWorkBullets(),
    "",
    "## Hire",
    "",
    "Use this site when you need a senior frontend engineer for React/Next.js product UI: reporting surfaces, form/admin workflows, and platform cleanup, with AI-native delivery that is still reviewed, tested, and owned.",
    "",
    `- Email: ${CONTACT_EMAIL}`,
    `- Contact form: ${SITE_ORIGIN}/contact`,
    `- LinkedIn: ${LINKEDIN_HREF}`,
    `- GitHub: ${GITHUB_HREF}`,
    `- Resume (PDF): ${SITE_ORIGIN}${RESUME_PDF_HREF}`,
    "",
  ].join("\n");
}

export function contactMarkdown(): string {
  return [
    `# Contact · ${ABOUT_NAME}`,
    "",
    `${ABOUT_NAME} is open to senior frontend / product UI roles. ${ABOUT_AVAILABILITY}. Based ${BASED_LOCATION}.`,
    "",
    "Use this page when you want to hire or brief Vishal Kumar: recruiting for a remote senior frontend role, a product-UI contract, or a collaboration that needs reporting, forms, or platform cleanup in React/Next.js.",
    "",
    "Send a short note with the company, the problem, the tools, timeline, and whether the work is a role or a contract. The form posts to /api/contact and emails the same inbox as the address below. You can skip the form and write directly.",
    "",
    `## Reach ${ABOUT_NAME}`,
    "",
    `- Email: [${CONTACT_EMAIL}](mailto:${CONTACT_EMAIL})`,
    `- Form: ${SITE_ORIGIN}/contact`,
    `- LinkedIn: ${LINKEDIN_HREF}`,
    `- GitHub: ${GITHUB_HREF}`,
    `- Resume (PDF): ${SITE_ORIGIN}${RESUME_PDF_HREF}`,
    "",
    "I read hiring mail myself. I do not sell contact data.",
    "",
    `- About: ${SITE_ORIGIN}/about`,
    "",
  ].join("\n");
}

export function resumeMarkdown(): string {
  return [
    `# Resume · ${ABOUT_NAME}`,
    "",
    `PDF resume for ${ABOUT_NAME} — ${ABOUT_META}.`,
    "",
    "The Resume Mode on this site is a PDF viewer. The canonical CV is the downloadable file, not an HTML restatement. Use it when you need employment history, stack, and role scope for a hiring packet.",
    "",
    `- Download: ${SITE_ORIGIN}${RESUME_PDF_HREF}`,
    `- About: ${SITE_ORIGIN}/about`,
    `- Contact: ${SITE_ORIGIN}/contact`,
    `- Availability: ${ABOUT_AVAILABILITY}`,
    "",
  ].join("\n");
}

export function markdownForPath(pathname: string): string | undefined {
  const path = normalizePathname(pathname);
  switch (path) {
    case "/":
    case "/about":
      return aboutMarkdown();
    case "/contact":
      return contactMarkdown();
    case "/resume":
      return resumeMarkdown();
    case "/work":
      return workIndexMarkdown();
    default:
      return workCaseMarkdown(path);
  }
}

export function notFoundMarkdown(): string {
  return [
    "# Not found",
    "",
    `That path is not a page on ${SITE_ORIGIN}.`,
    "",
    "This is a personal portfolio with a small, finite URL set. If you were probing for a resource, treat this as a real 404 — do not assume the App Shell means the path exists.",
    "",
    `- [Sitemap](${SITE_ORIGIN}/sitemap.xml): indexable URLs`,
    `- [llms.txt](${SITE_ORIGIN}/llms.txt): when to use this site, plus page index`,
    `- [About](${SITE_ORIGIN}/about): who ${ABOUT_NAME} is`,
    `- [Work](${SITE_ORIGIN}/work): selected work`,
    `- [Contact](${SITE_ORIGIN}/contact): hire / email`,
    "",
  ].join("\n");
}

function inlineMarkdown(text: string): string {
  const escaped = escapeHtmlText(text);
  return escaped
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/`([^`]+)`/g, "<code>$1</code>");
}

function blocksFromMarkdown(markdown: string): string[] {
  const lines = markdown.trim().split("\n");
  const blocks: string[] = [];
  let buf: string[] = [];
  let inList = false;

  const flush = () => {
    if (buf.length === 0) return;
    blocks.push(buf.join("\n"));
    buf = [];
    inList = false;
  };

  for (const line of lines) {
    if (line.startsWith("#")) {
      flush();
      blocks.push(line);
      continue;
    }
    if (line.startsWith("- ")) {
      if (!inList) {
        flush();
        inList = true;
      }
      buf.push(line);
      continue;
    }
    if (line.trim() === "") {
      flush();
      continue;
    }
    if (inList) flush();
    buf.push(line);
  }
  flush();
  return blocks;
}

function htmlFromBlocks(blocks: string[]): string {
  const body = blocks
    .map((block) => {
      if (block.startsWith("# ")) {
        return `<h1>${escapeHtmlText(block.slice(2))}</h1>`;
      }
      if (block.startsWith("## ")) {
        return `<h2>${escapeHtmlText(block.slice(3))}</h2>`;
      }
      if (block.startsWith("> ")) {
        return `<p>${inlineMarkdown(block.replace(/^> /, ""))}</p>`;
      }
      if (block.startsWith("- ")) {
        const items = block
          .split("\n")
          .filter((line) => line.startsWith("- "))
          .map((line) => `<li>${inlineMarkdown(line.slice(2))}</li>`)
          .join("");
        return `<ul>${items}</ul>`;
      }
      return `<p>${inlineMarkdown(block)}</p>`;
    })
    .join("\n");
  return `<article data-crawler-content>\n${body}\n</article>`;
}

export function crawlerHtmlForPath(pathname: string): string {
  const markdown = markdownForPath(pathname) ?? notFoundMarkdown();
  return htmlFromBlocks(blocksFromMarkdown(markdown));
}

export function visibleTextFromHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

export function identityJsonLd(): unknown {
  const personId = `${SITE_ORIGIN}/#person`;
  const orgId = `${SITE_ORIGIN}/#org`;
  const websiteId = `${SITE_ORIGIN}/#website`;
  const alternateName = [...SITE_ALTERNATE_NAMES];
  const address = {
    "@type": "PostalAddress",
    addressLocality: "Punjab",
    addressRegion: "Punjab",
    addressCountry: "IN",
  };
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": personId,
        name: ABOUT_NAME,
        givenName: "Vishal",
        familyName: "Kumar",
        alternateName,
        url: `${SITE_ORIGIN}/`,
        email: CONTACT_EMAIL,
        jobTitle: ABOUT_META,
        description: ABOUT_PITCH,
        address,
        sameAs: [LINKEDIN_HREF, GITHUB_HREF],
        worksFor: { "@id": orgId },
      },
      {
        "@type": "Organization",
        "@id": orgId,
        name: ABOUT_NAME,
        alternateName,
        url: `${SITE_ORIGIN}/`,
        email: CONTACT_EMAIL,
        founder: { "@id": personId },
        address,
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "customer support",
          email: CONTACT_EMAIL,
          url: `${SITE_ORIGIN}/contact`,
          availableLanguage: ["English"],
        },
        sameAs: [LINKEDIN_HREF, GITHUB_HREF],
      },
      {
        "@type": "WebSite",
        "@id": websiteId,
        name: ABOUT_NAME,
        alternateName,
        url: `${SITE_ORIGIN}/`,
        publisher: { "@id": personId },
      },
    ],
  };
}

export function jsonLdScriptTag(): string {
  return `<script type="application/ld+json">${JSON.stringify(identityJsonLd())}</script>`;
}

export function llmsTxt(): string {
  const pages = [
    `- [About](${SITE_ORIGIN}/about.md): Who ${ABOUT_NAME} is, skills, selected work, and how to hire`,
    `- [Home](${SITE_ORIGIN}/index.md): Same About narrative as the canonical homepage`,
    `- [Work](${SITE_ORIGIN}/work.md): Selected work index`,
    `- [Contact](${SITE_ORIGIN}/contact.md): Email, form, LinkedIn, GitHub`,
    `- [Resume](${SITE_ORIGIN}/resume.md): PDF resume pointer`,
  ];
  for (const folder of WORK_FOLDERS) {
    for (const workCase of folder.cases) {
      pages.push(
        `- [${workCase.title}](${markdownUrlForPath(workCaseHref(folder.slug, workCase.slug))}): ${workCase.lede ?? workCase.role}`,
      );
    }
  }

  return [
    `# ${ABOUT_NAME}`,
    "",
    `> ${ABOUT_META}. Personal portfolio at ${SITE_ORIGIN} — App Shell over Work, About, Resume, and Contact. Not a SaaS product, chatbot, or API.`,
    "",
    `When to use this site: reach for ${ABOUT_NAME} when a remote team needs a senior frontend engineer for React/Next.js product UI — reporting surfaces, form/admin workflows, and platform cleanup — with AI-native delivery that is still reviewed, tested, and owned. Do not use this site as a generic component library, an agency roster, or a place to file production incidents; there is no public API to call. For hiring, email or the contact form is the call: include the company, problem, stack, and timeline.`,
    "",
    "## When to use this",
    "",
    `- [Hiring a senior frontend engineer](${SITE_ORIGIN}/contact.md): Remote product-UI roles and contracts — email ${CONTACT_EMAIL} or use the form`,
    `- [Reviewing shipped product UI](${SITE_ORIGIN}/work.md): Reporting, forms, and platform work with proof-first case writeups`,
    `- [Reading the CV](${SITE_ORIGIN}${RESUME_PDF_HREF}): PDF resume, not an HTML restatement`,
    "",
    "## Pages",
    "",
    ...pages,
    "",
    "## Optional",
    "",
    `- [Sitemap](${SITE_ORIGIN}/sitemap.xml): All indexable URLs`,
    `- [LinkedIn](${LINKEDIN_HREF}): Professional profile`,
    `- [GitHub](${GITHUB_HREF}): Public code`,
    "",
  ].join("\n");
}

export function sitemapXml(paths: readonly string[], lastmod: string): string {
  const urls = paths
    .map((path) => {
      const loc = path === "/" ? `${SITE_ORIGIN}/` : `${SITE_ORIGIN}${path}`;
      return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`;
    })
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

export function notFoundHtmlDocument(): string {
  const inner = htmlFromBlocks(blocksFromMarkdown(notFoundMarkdown()));
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Not found · ${escapeHtmlText(SITE_NAME)}</title>
    <meta name="robots" content="noindex" />
    <link rel="canonical" href="${SITE_ORIGIN}/" />
  </head>
  <body>
    ${inner}
  </body>
</html>
`;
}
