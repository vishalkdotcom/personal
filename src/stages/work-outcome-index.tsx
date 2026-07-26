import { A, useNavigate } from "@solidjs/router";
import { For, Show, type Component } from "solid-js";
import { WORK_FOLDERS, workCaseHref, type WorkCase, type WorkFolder } from "../work/inventory";
import { tryResolveWorkMediaSrc } from "../work/work-case-media";

function isModifiedClick(event: MouseEvent): boolean {
  return event.button !== 0 || event.metaKey || event.altKey || event.ctrlKey || event.shiftKey;
}

/** First Work Case media slide inventory `src`, when present. */
function indexThumbInventorySrc(workCase: WorkCase): string | undefined {
  return workCase.media?.find((slide) => slide.src)?.src;
}

const metaClass = "shrink-0 text-[11px] font-[550] whitespace-nowrap text-faint";

const thumbFrameClass = "h-10 w-16 shrink-0 overflow-hidden rounded-md border border-border bg-bg";

const IndexThumbGlyph: Component = () => (
  <div
    class={`${thumbFrameClass} grid place-items-center border-dashed bg-bg-deep text-faint`}
    data-index-thumb="glyph"
    aria-hidden="true"
  >
    <svg class="size-[18px] opacity-55" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <rect x="3" y="5" width="18" height="14" rx="2" stroke-width="1.5" />
      <circle cx="9" cy="10" r="1.5" stroke-width="1.5" />
      <path d="M3 16l5-4 4 3 4-5 5 6" stroke-width="1.5" />
    </svg>
  </div>
);

const IndexThumb: Component<{ workCase: WorkCase }> = (props) => {
  const thumbSrc = () => {
    const inventorySrc = indexThumbInventorySrc(props.workCase);
    return inventorySrc ? tryResolveWorkMediaSrc(inventorySrc) : undefined;
  };

  return (
    <Show when={thumbSrc()} fallback={<IndexThumbGlyph />}>
      {(src) => (
        <div class={thumbFrameClass} data-index-thumb="media" aria-hidden="true">
          <img
            src={src()}
            alt=""
            loading="lazy"
            decoding="async"
            class="h-10 w-16 object-cover object-left-top"
          />
        </div>
      )}
    </Show>
  );
};

const IndexRow: Component<{ folderSlug: string; workCase: WorkCase }> = (props) => {
  const navigate = useNavigate();
  const href = () => workCaseHref(props.folderSlug, props.workCase.slug);
  const blurb = () => props.workCase.outcomes[0] ?? "";

  return (
    <A
      href={href()}
      class="grid w-full grid-cols-[64px_1fr_auto] items-center gap-3.5 rounded-lg border border-border bg-bg-deep px-3 py-2.5 no-underline hover:bg-bg-hover"
      activeClass=""
      inactiveClass=""
      aria-label={`${props.workCase.title} ${props.workCase.badge}`}
      onClick={(event) => {
        if (event.defaultPrevented || isModifiedClick(event)) return;
        event.preventDefault();
        navigate(href());
      }}
    >
      <IndexThumb workCase={props.workCase} />
      <div class="min-w-0">
        <div class="mb-[3px] text-sm font-semibold">{props.workCase.title}</div>
        <div class="text-[12.5px] leading-[1.4] text-muted">{blurb()}</div>
      </div>
      <div class={metaClass}>{props.workCase.badge}</div>
    </A>
  );
};

const IndexList: Component<{
  folderSlug: string;
  cases: WorkCase[];
  "aria-label"?: string;
}> = (props) => (
  <ul class="m-0 grid max-w-[720px] list-none gap-1.5 p-0" aria-label={props["aria-label"]}>
    <For each={props.cases}>
      {(workCase) => (
        <li class="m-0 p-0">
          <IndexRow folderSlug={props.folderSlug} workCase={workCase} />
        </li>
      )}
    </For>
  </ul>
);

type IndexHeadProps = {
  kicker: string;
  title: string;
  lede: string;
};

const IndexHead: Component<IndexHeadProps> = (props) => (
  <header class="mb-4.5">
    <p class="mb-2 mt-0 text-[11px] tracking-[0.12em] text-faint uppercase">{props.kicker}</p>
    <h1 class="mb-2.5 mt-0 text-2xl font-[650] tracking-[-0.03em]">{props.title}</h1>
    <p class="m-0 max-w-[52ch] text-[15px] leading-[1.55] text-muted">{props.lede}</p>
  </header>
);

type WorkFolderIndexProps = {
  folder: WorkFolder;
};

/** Dense outcome list for one Work Folder — prototype SoT employer/index composition. */
export const WorkFolderIndex: Component<WorkFolderIndexProps> = (props) => (
  <article aria-label={`${props.folder.title} outcome index`}>
    <IndexHead
      kicker="Work"
      title={props.folder.title}
      lede="Cases in this group — what shipped and what changed."
    />
    <IndexList
      folderSlug={props.folder.slug}
      cases={props.folder.cases}
      aria-label="Outcome index"
    />
  </article>
);

/** Work-root dense outcome list across all Work Folders. */
export const WorkRootIndex: Component = () => (
  <article aria-label="All work outcome index">
    <IndexHead
      kicker="Work"
      title="All work"
      lede="Here's the work — what shipped and what it changed."
    />
    <div class="grid max-w-[720px] gap-1.5">
      <For each={WORK_FOLDERS}>
        {(folder) => (
          <section aria-label={folder.title}>
            <div class="px-1 pt-3.5 pb-1.5 text-[11px] tracking-[0.08em] text-faint uppercase">
              {folder.title}
            </div>
            <IndexList
              folderSlug={folder.slug}
              cases={folder.cases}
              aria-label={`${folder.title} outcome index`}
            />
          </section>
        )}
      </For>
    </div>
  </article>
);
