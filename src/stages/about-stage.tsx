import { A } from "@solidjs/router";
import { For, Show, type Component } from "solid-js";
import {
  ABOUT_META,
  ABOUT_NAME,
  ABOUT_PITCH,
  ABOUT_SELECTED_WORK,
  ABOUT_SKILLS,
} from "../about/content";
import { StageTitle } from "../shell/stage-title";
import {
  getWorkCase,
  getWorkFolder,
  workCaseHref,
  workRootHref,
  type WorkCase,
} from "../work/inventory";
import { tryResolveWorkMediaSrc } from "../work/work-case-media";

/** Quiet densify strip frame — ~56px desktop / ~88px mobile (locked prototype). */
const mediaFrameClass =
  "h-[88px] w-full overflow-hidden rounded-md border border-border bg-bg md:h-14";

export type SelectedWorkView = {
  href: string;
  title: string;
  blurb: string;
  meta: string;
  mediaSrc?: string;
};

function quietMeta(folderTitle: string, badge: "Production" | "Prototype"): string {
  return badge === "Prototype" ? badge : folderTitle;
}

function peekMediaSrc(workCase: WorkCase): string | undefined {
  const inventorySrc = workCase.media?.find((slide) => slide.src)?.src;
  return inventorySrc ? tryResolveWorkMediaSrc(inventorySrc) : undefined;
}

/** Join locked curation to inventory once — fail at module load if slugs drift. */
const SELECTED_WORK_VIEWS: SelectedWorkView[] = ABOUT_SELECTED_WORK.map((peek) => {
  const folder = getWorkFolder(peek.folderSlug);
  const workCase = getWorkCase(peek.folderSlug, peek.caseSlug);
  if (!folder || !workCase) {
    throw new Error(
      `Selected work peek missing inventory case ${peek.folderSlug}/${peek.caseSlug}`,
    );
  }
  return {
    href: workCaseHref(peek.folderSlug, peek.caseSlug),
    title: workCase.title,
    blurb: peek.blurb,
    meta: quietMeta(folder.title, workCase.badge),
    mediaSrc: peekMediaSrc(workCase),
  };
});

const SelectedWorkMediaPlate: Component<{ src?: string }> = (props) => (
  <Show
    when={props.src}
    fallback={
      <div
        class={`${mediaFrameClass} grid place-items-center border-dashed bg-bg-deep text-faint`}
        data-selected-work-media="glyph"
        aria-hidden="true"
      >
        <svg class="size-[22px] opacity-55" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <rect x="3" y="5" width="18" height="14" rx="2" stroke-width="1.5" />
          <circle cx="9" cy="10" r="1.5" stroke-width="1.5" />
          <path d="M3 16l5-4 4 3 4-5 5 6" stroke-width="1.5" />
        </svg>
      </div>
    }
  >
    {(src) => (
      <div class={mediaFrameClass} data-selected-work-media="media" aria-hidden="true">
        <img
          src={src()}
          alt=""
          loading="lazy"
          decoding="async"
          class="size-full object-cover object-left-top"
        />
      </div>
    )}
  </Show>
);

const SelectedWorkPeek: Component<{ view: SelectedWorkView }> = (props) => (
  <li class="m-0 min-w-0 p-0">
    <A
      href={props.view.href}
      class="flex h-full min-h-[132px] flex-col gap-2 rounded-[10px] border border-transparent bg-bg-deep p-3 no-underline hover:bg-bg-hover"
      activeClass=""
      inactiveClass=""
      aria-label={`${props.view.title}. ${props.view.blurb} ${props.view.meta}`}
    >
      <SelectedWorkMediaPlate src={props.view.mediaSrc} />
      <strong class="text-[13px] font-semibold">{props.view.title}</strong>
      <span class="flex-1 text-xs leading-[1.4] text-muted">{props.view.blurb}</span>
      <em class="text-[11px] text-faint not-italic">{props.view.meta}</em>
    </A>
  </li>
);

/**
 * Soft-panel Selected work peeks. Exported so App Shell seam tests can fixture a
 * media-less peek without reopening the locked densify trio.
 */
export const SelectedWorkPeekList: Component<{ views: readonly SelectedWorkView[] }> = (props) => (
  <ul
    class="m-0 grid list-none grid-cols-1 gap-2.5 p-0 md:grid-cols-3 md:gap-3.5"
    aria-label="Selected work"
  >
    <For each={[...props.views]}>{(view) => <SelectedWorkPeek view={view} />}</For>
  </ul>
);

/**
 * About Mode center: locked D pitch + unboxed skills + Selected work strip.
 * Composition SoT: about-selected-work-media-locked (extends about-densify-locked).
 */
export const AboutStage: Component = () => (
  <article aria-label="About">
    <p class="mb-2 mt-0 text-[11px] tracking-[0.12em] text-faint uppercase">About</p>
    <StageTitle size="lg">{ABOUT_NAME}</StageTitle>
    <p class="m-0 mb-5.5 text-[13px] leading-normal text-muted">{ABOUT_META}</p>
    <p class="m-0 mb-[18px] max-w-[48ch] text-base leading-[1.55] text-muted">{ABOUT_PITCH}</p>
    <ul
      class="m-0 flex max-w-[520px] list-none flex-wrap gap-x-[18px] gap-y-2.5 p-0"
      aria-label="Skills"
    >
      <For each={[...ABOUT_SKILLS]}>
        {(skill) => (
          <li class="inline-flex items-center gap-2 text-sm text-fg">
            <span class="size-2 rounded-full bg-accent opacity-70" aria-hidden="true" />
            {skill}
          </li>
        )}
      </For>
    </ul>

    <section class="mt-7 max-w-[640px] border-t border-border pt-[18px]" aria-label="Selected work">
      <div class="mb-3 flex items-baseline justify-between gap-3">
        <h2 class="m-0 text-[11px] font-semibold tracking-[0.08em] text-faint uppercase">
          Selected work
        </h2>
        <A
          href={workRootHref()}
          class="text-xs font-[550] text-accent no-underline hover:underline"
          activeClass=""
          inactiveClass=""
        >
          All work →
        </A>
      </div>
      <SelectedWorkPeekList views={SELECTED_WORK_VIEWS} />
    </section>
  </article>
);
