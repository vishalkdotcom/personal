import { A } from "@solidjs/router";
import { For, type Component } from "solid-js";
import {
  ABOUT_META,
  ABOUT_NAME,
  ABOUT_PITCH,
  ABOUT_SELECTED_WORK,
  ABOUT_SKILLS,
} from "../about/content";
import { StageTitle } from "../shell/stage-title";
import { getWorkCase, getWorkFolder, workCaseHref, workRootHref } from "../work/inventory";

/** Soft-panel thumb plates from about-densify-locked (decorative, not case masters). */
const PEEK_THUMB_TONES = [
  "bg-[linear-gradient(135deg,rgba(108,182,255,0.22),transparent_55%),linear-gradient(180deg,var(--color-bg-hover),var(--color-bg-deep))]",
  "bg-[linear-gradient(135deg,rgba(93,186,122,0.18),transparent_55%),linear-gradient(180deg,var(--color-bg-hover),var(--color-bg-deep))]",
  "bg-[linear-gradient(135deg,rgba(232,180,120,0.18),transparent_55%),linear-gradient(180deg,var(--color-bg-hover),var(--color-bg-deep))]",
] as const;

type SelectedWorkView = {
  href: string;
  title: string;
  blurb: string;
  meta: string;
  thumbTone: string;
};

function quietMeta(folderTitle: string, badge: "Production" | "Prototype"): string {
  return badge === "Prototype" ? badge : folderTitle;
}

/** Join locked curation to inventory once — fail at module load if slugs drift. */
const SELECTED_WORK_VIEWS: SelectedWorkView[] = ABOUT_SELECTED_WORK.map((peek, index) => {
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
    thumbTone: PEEK_THUMB_TONES[index % PEEK_THUMB_TONES.length]!,
  };
});

const SelectedWorkPeek: Component<{ view: SelectedWorkView }> = (props) => (
  <li class="m-0 min-w-0 p-0">
    <A
      href={props.view.href}
      class="flex min-h-[132px] flex-col gap-2 rounded-[10px] border border-transparent bg-bg-deep p-3 no-underline hover:bg-bg-hover"
      activeClass=""
      inactiveClass=""
      aria-label={`${props.view.title}. ${props.view.blurb} ${props.view.meta}`}
    >
      <div class={`h-14 w-full rounded-md ${props.view.thumbTone}`} aria-hidden="true" />
      <strong class="text-[13px] font-semibold">{props.view.title}</strong>
      <span class="flex-1 text-xs leading-[1.4] text-muted">{props.view.blurb}</span>
      <em class="text-[11px] text-faint not-italic">{props.view.meta}</em>
    </A>
  </li>
);

/**
 * About Mode center: locked D pitch + unboxed skills + Selected work strip.
 * Composition SoT: about-densify-locked (extends shell-round-9 D).
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
      <ul class="m-0 grid list-none grid-cols-3 gap-3.5 p-0" aria-label="Selected work">
        <For each={SELECTED_WORK_VIEWS}>{(view) => <SelectedWorkPeek view={view} />}</For>
      </ul>
    </section>
  </article>
);
