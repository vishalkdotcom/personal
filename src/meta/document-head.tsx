import { Link, Meta, Title } from "@solidjs/meta";
import { useLocation } from "@solidjs/router";
import { For, Show } from "solid-js";
import { headTagsFor } from "./head-tags";
import { pageMetaForPath } from "./route-manifest";

/**
 * Keeps document head in sync with the active deep link during in-app navigation.
 * Build-time stamped shells (with `data-sm`) cover cold load; MetaProvider clears
 * those on client boot, then this component owns head via `@solidjs/meta`.
 *
 * Keyed remount per pathname avoids Solid 2 untracked reads inside solid-meta's
 * createRenderEffect when Title/Meta props change in place.
 */
export function DocumentHead() {
  const location = useLocation();

  return (
    <Show when={location.pathname} keyed>
      {(pathname) => <DocumentHeadTags pathname={pathname} />}
    </Show>
  );
}

function DocumentHeadTags(props: { pathname: string }) {
  const tags = headTagsFor(pageMetaForPath(props.pathname));

  return (
    <For each={tags}>
      {(tag) => {
        switch (tag.kind) {
          case "title":
            return <Title>{tag.text}</Title>;
          case "meta":
            return tag.name ? (
              <Meta name={tag.name} content={tag.content} />
            ) : (
              <Meta property={tag.property} content={tag.content} />
            );
          case "link":
            return <Link rel={tag.rel} href={tag.href} type={tag.type} />;
        }
      }}
    </For>
  );
}
