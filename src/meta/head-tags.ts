import type { PageMeta } from "./route-manifest";
import { DEFAULT_OG_TYPE, OG_IMAGE_URL, SITE_NAME } from "./site";

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
  | { kind: "link"; dataSm: string; rel: string; href: string };

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
      kind: "link",
      dataSm: "stamp-canonical",
      rel: "canonical",
      href: meta.canonical,
    },
  ];
}
