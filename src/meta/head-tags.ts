import { markdownOutputPath } from "./shell-paths";
import { SAME_AS_URLS } from "../agent/identity";
import type { PageMeta } from "./route-manifest";
import { DEFAULT_OG_TYPE, OG_IMAGE_URL, SITE_NAME, SITE_ORIGIN } from "./site";

/** Single SoT for head tags shared by stamped shells and `@solidjs/meta`. */
export type HeadTag =
  | { kind: "title"; dataSm: string; text: string }
  | {
      kind: "meta";
      dataSm: string;
      name?: string;
      property?: string;
      content: string;
    }
  | { kind: "link"; dataSm: string; rel: string; href: string; type?: string };

function markdownHrefFor(path: string): string {
  const relative = markdownOutputPath(path);
  return relative.startsWith("/") ? relative : `/${relative}`;
}

export function headTagsFor(meta: PageMeta): HeadTag[] {
  return [
    { kind: "title", dataSm: "stamp-title", text: meta.title },
    {
      kind: "meta",
      dataSm: "stamp-description",
      name: "description",
      content: meta.description,
    },
    {
      kind: "meta",
      dataSm: "stamp-og-title",
      property: "og:title",
      content: meta.title,
    },
    {
      kind: "meta",
      dataSm: "stamp-og-description",
      property: "og:description",
      content: meta.description,
    },
    {
      kind: "meta",
      dataSm: "stamp-og-url",
      property: "og:url",
      content: meta.canonical,
    },
    {
      kind: "meta",
      dataSm: "stamp-og-type",
      property: "og:type",
      content: DEFAULT_OG_TYPE,
    },
    {
      kind: "meta",
      dataSm: "stamp-og-site-name",
      property: "og:site_name",
      content: SITE_NAME,
    },
    {
      kind: "meta",
      dataSm: "stamp-og-image",
      property: "og:image",
      content: OG_IMAGE_URL,
    },
    {
      kind: "meta",
      dataSm: "stamp-twitter-card",
      name: "twitter:card",
      content: "summary_large_image",
    },
    {
      kind: "meta",
      dataSm: "stamp-twitter-title",
      name: "twitter:title",
      content: meta.title,
    },
    {
      kind: "meta",
      dataSm: "stamp-twitter-description",
      name: "twitter:description",
      content: meta.description,
    },
    {
      kind: "meta",
      dataSm: "stamp-twitter-image",
      name: "twitter:image",
      content: OG_IMAGE_URL,
    },
    {
      kind: "link",
      dataSm: "stamp-canonical",
      rel: "canonical",
      href: meta.canonical,
    },
    {
      kind: "link",
      dataSm: "stamp-llms",
      rel: "describedby",
      href: `${SITE_ORIGIN}/llms.txt`,
    },
    {
      kind: "link",
      dataSm: "stamp-md-alternate",
      rel: "alternate",
      type: "text/markdown",
      href: `${SITE_ORIGIN}${markdownHrefFor(meta.path)}`,
    },
    ...SAME_AS_URLS.map(
      (href, index): HeadTag => ({
        kind: "link",
        dataSm: `stamp-me-${index}`,
        rel: "me",
        href,
      }),
    ),
  ];
}
