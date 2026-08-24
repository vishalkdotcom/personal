import type { Component } from "solid-js";
import { For } from "solid-js";
import { A } from "@solidjs/router";
import { PRIVACY_PARAGRAPHS } from "../privacy/content";
import { StageTitle } from "../shell/stage-title";

/**
 * Privacy trust page — App Shell stage using the same copy as crawlable HTML / markdown.
 */
export const PrivacyStage: Component = () => (
  <article aria-label="Privacy">
    <p class="mb-2 mt-0 text-[11px] tracking-[0.12em] text-faint uppercase">Privacy</p>
    <StageTitle>Privacy</StageTitle>
    <div class="flex max-w-[52ch] flex-col gap-3.5">
      <For each={[...PRIVACY_PARAGRAPHS]}>
        {(paragraph) => <p class="m-0 text-[13px] leading-[1.5] text-muted">{paragraph}</p>}
      </For>
    </div>
    <p class="m-0 mt-5 text-[12px] text-faint">
      <A href="/contact" class="text-accent underline-offset-2 hover:underline">
        Contact
      </A>
    </p>
  </article>
);
