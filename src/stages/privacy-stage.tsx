import { A } from "@solidjs/router";
import type { Component } from "solid-js";
import { For } from "solid-js";
import { CONTACT_EMAIL } from "../contact/content";
import { PRIVACY_LEAD, PRIVACY_SECTIONS, PRIVACY_TITLE } from "../privacy/content";
import { StageTitle } from "../shell/stage-title";

/** Privacy document in the App Shell — trust page for humans and agents. */
export const PrivacyStage: Component = () => (
  <article aria-label="Privacy">
    <p class="mb-2 mt-0 text-[11px] tracking-[0.12em] text-faint uppercase">Legal</p>
    <StageTitle>{PRIVACY_TITLE}</StageTitle>
    <p class="m-0 mb-5 max-w-[52ch] text-[13px] leading-[1.45] text-muted">{PRIVACY_LEAD}</p>
    <For each={[...PRIVACY_SECTIONS]}>
      {(section) => (
        <section class="mb-5 max-w-[52ch]">
          <h2 class="m-0 mb-2 text-sm font-semibold text-fg">{section.heading}</h2>
          <p class="m-0 text-[13px] leading-[1.5] text-muted">{section.body}</p>
        </section>
      )}
    </For>
    <p class="m-0 max-w-[52ch] text-[13px] leading-[1.45] text-muted">
      Questions:{" "}
      <a class="text-accent underline-offset-2 hover:underline" href={`mailto:${CONTACT_EMAIL}`}>
        {CONTACT_EMAIL}
      </a>
      {" · "}
      <A href="/contact" class="text-accent underline-offset-2 hover:underline">
        Contact
      </A>
    </p>
  </article>
);
