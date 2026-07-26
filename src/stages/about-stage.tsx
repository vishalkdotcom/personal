import { For, type Component } from "solid-js";
import { ABOUT_META, ABOUT_NAME, ABOUT_PITCH, ABOUT_SKILLS } from "../about/content";

/**
 * About Mode center: pitch + skills strip (no seeking-roles line).
 * Composition SoT: shell-round-9 variant D.
 */
export const AboutStage: Component = () => (
  <article aria-label="About">
    <p class="mb-2 mt-0 text-[11px] tracking-[0.12em] text-faint uppercase">About</p>
    <h1 class="vk-stage-title vk-stage-title-lg">{ABOUT_NAME}</h1>
    <p class="m-0 mb-5.5 text-[13px] leading-normal text-muted">{ABOUT_META}</p>
    <p class="m-0 mb-6 max-w-[48ch] text-base leading-[1.55] text-muted">{ABOUT_PITCH}</p>
    <ul class="m-0 flex list-none flex-wrap gap-2 p-0" aria-label="Skills">
      <For each={[...ABOUT_SKILLS]}>
        {(skill) => (
          <li class="inline-flex items-center gap-1.5 rounded-md border border-border bg-bg-deep px-2.5 py-1.5 text-[12.5px] text-muted">
            <span class="size-1.5 rounded-full bg-accent" aria-hidden="true" />
            {skill}
          </li>
        )}
      </For>
    </ul>
  </article>
);
