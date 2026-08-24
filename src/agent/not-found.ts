import { SITE_NAME, SITE_ORIGIN } from "../meta/site";

/** Short markdown 404 body pointing agents at indexes (Is Agentic / Ora 404 credit). */
export const NOT_FOUND_MARKDOWN = `# Not found

This path does not exist on ${SITE_NAME}'s site (${SITE_ORIGIN}).

Use these indexes instead:

- [llms.txt](${SITE_ORIGIN}/llms.txt) — when to use this site and how to call it
- [Sitemap](${SITE_ORIGIN}/sitemap.xml) — indexable URLs
- [About](${SITE_ORIGIN}/) — person, skills, selected work
- [Contact](${SITE_ORIGIN}/contact) — email and form
`;

export function notFoundHtml(): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="robots" content="noindex" />
    <title>Not found · ${SITE_NAME}</title>
  </head>
  <body>
    <main>
      <pre>${NOT_FOUND_MARKDOWN.replace(/</g, "&lt;")}</pre>
    </main>
  </body>
</html>
`;
}
