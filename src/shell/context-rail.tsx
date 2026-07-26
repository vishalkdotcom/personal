import { A, useLocation } from "@solidjs/router";
import { For, Match, Show, Switch, type Component } from "solid-js";
import { ABOUT_AVAILABILITY, ABOUT_ELSEWHERE, ABOUT_FACTS } from "../about/content";
import { CONTACT_AVAILABILITY, CONTACT_QUICK_LINKS } from "../contact/content";
import { RESUME_LINKS } from "../resume/content";
import { getWorkCaseFromPath, isHttpLiveUrl, type WorkCase } from "../work/inventory";
import { modeForPath } from "./modes";
import { isHireSignalEnabled } from "./hire-signal";

const sectionHeadingClass = "m-0 text-[11px] font-[650] tracking-[0.06em] text-faint uppercase";

const sectionBodyClass = "m-0 mt-1.5 text-[12.5px] leading-[1.45] text-muted";

const ctaClass =
  "inline-flex items-center justify-center rounded-md border border-border bg-bg-panel px-2.5 py-1.5 text-[12px] font-medium text-fg hover:bg-bg-hover";

const linkClass = "text-accent underline-offset-2 hover:underline";

type RailLink = {
  label: string;
  href: string;
  external?: boolean;
};

/** Shared Context Rail link rendering for About / Resume / Contact lists. */
const RailLinkItem: Component<{ link: RailLink }> = (props) => {
  const href = () => props.link.href;
  return (
    <Switch
      fallback={
        <A href={href()} class={linkClass}>
          {props.link.label}
        </A>
      }
    >
      <Match when={props.link.external}>
        <a href={href()} class={linkClass} target="_blank" rel="noreferrer">
          {props.link.label}
        </a>
      </Match>
      <Match when={href().startsWith("mailto:")}>
        <a href={href()} class={linkClass}>
          {props.link.label}
        </a>
      </Match>
      <Match when={/\.pdf$/i.test(href())}>
        <a href={href()} class={linkClass} download>
          {props.link.label}
        </a>
      </Match>
    </Switch>
  );
};

const RailLinkList: Component<{ links: readonly RailLink[] }> = (props) => (
  <ul class="m-0 mt-1.5 list-none space-y-2 p-0 text-[12.5px] leading-[1.45]">
    <For each={[...props.links]}>
      {(link) => (
        <li>
          <RailLinkItem link={link} />
        </li>
      )}
    </For>
  </ul>
);

/** Shared desktop Hire Signal Availability section (one copy + gated CTA). */
const HireSignalAvailability: Component<{ ctaLabel: string }> = (props) => (
  <Show when={isHireSignalEnabled()}>
    <section class="vk-rail-module" aria-labelledby="rail-availability">
      <h2 id="rail-availability" class={sectionHeadingClass}>
        Availability
      </h2>
      <p class={sectionBodyClass}>{ABOUT_AVAILABILITY}</p>
      <A href="/contact" class={`${ctaClass} mt-2`}>
        {props.ctaLabel}
      </A>
    </section>
  </Show>
);

/** Work Case footer hire CTA — gated with Hire Signal; never snoozed. */
const HireSignalFooterCta: Component = () => (
  <Show when={isHireSignalEnabled()}>
    <section class="vk-rail-module" aria-label="Get in touch">
      <A href="/contact" class={`${ctaClass} w-full`}>
        Get in touch
      </A>
    </section>
  </Show>
);

const WorkCaseContext: Component<{ workCase: WorkCase }> = (props) => (
  <div class="vk-rail-stack">
    <HireSignalAvailability ctaLabel="Open to roles" />

    <section class="vk-rail-module" aria-labelledby="rail-live">
      <h2 id="rail-live" class={sectionHeadingClass}>
        Live
      </h2>
      <Show
        when={isHttpLiveUrl(props.workCase.live)}
        fallback={<p class={sectionBodyClass}>{props.workCase.live}</p>}
      >
        <p class={sectionBodyClass}>
          <a href={props.workCase.live} class={linkClass} target="_blank" rel="noreferrer">
            {props.workCase.live.replace(/^https?:\/\//i, "")}
          </a>
        </p>
      </Show>
    </section>

    <section class="vk-rail-module" aria-labelledby="rail-role">
      <h2 id="rail-role" class={sectionHeadingClass}>
        Role
      </h2>
      <p class={sectionBodyClass}>{props.workCase.role}</p>
    </section>

    <section class="vk-rail-module" aria-labelledby="rail-outcomes">
      <h2 id="rail-outcomes" class={sectionHeadingClass}>
        Outcomes
      </h2>
      <ul class="m-0 mt-1.5 list-none space-y-1.5 p-0 text-[12.5px] leading-[1.45] text-muted">
        <For each={props.workCase.outcomes}>{(outcome) => <li>{outcome}</li>}</For>
      </ul>
    </section>

    <section class="vk-rail-module" aria-labelledby="rail-stack">
      <h2 id="rail-stack" class={sectionHeadingClass}>
        Stack
      </h2>
      <ul class="m-0 mt-1.5 flex list-none flex-wrap gap-1.5 p-0">
        <For each={props.workCase.stack}>
          {(item) => (
            <li class="rounded-md bg-bg-active px-1.5 py-0.5 text-[11px] text-muted">{item}</li>
          )}
        </For>
      </ul>
    </section>

    <HireSignalFooterCta />
  </div>
);

/** About Mode rail: Availability CTA → Facts → Elsewhere (shell-round-9 A). */
const AboutContext: Component = () => (
  <div class="vk-rail-stack">
    <HireSignalAvailability ctaLabel="Get in touch" />

    <section class="vk-rail-module" aria-labelledby="rail-facts">
      <h2 id="rail-facts" class={sectionHeadingClass}>
        Facts
      </h2>
      <dl class="m-0 mt-1.5 space-y-1">
        <For each={ABOUT_FACTS}>
          {(fact) => (
            <div class="flex justify-between gap-2.5 text-[12px]">
              <dt class="m-0 text-faint">{fact.label}</dt>
              <dd class="m-0 text-right text-muted">{fact.value}</dd>
            </div>
          )}
        </For>
      </dl>
    </section>

    <section class="vk-rail-module" aria-labelledby="rail-elsewhere">
      <h2 id="rail-elsewhere" class={sectionHeadingClass}>
        Elsewhere
      </h2>
      <RailLinkList links={ABOUT_ELSEWHERE} />
    </section>
  </div>
);

/** Resume Mode thin rail: Availability CTA → Links (PDF download + elsewhere). */
const ResumeContext: Component = () => (
  <div class="vk-rail-stack">
    <HireSignalAvailability ctaLabel="Get in touch" />

    <section class="vk-rail-module" aria-labelledby="rail-links">
      <h2 id="rail-links" class={sectionHeadingClass}>
        Links
      </h2>
      <RailLinkList links={RESUME_LINKS} />
    </section>
  </div>
);

/** Contact Mode rail: availability + email / LinkedIn / GitHub / CV (not Hire-Signal-gated). */
const ContactContext: Component = () => (
  <div class="vk-rail-stack">
    <section class="vk-rail-module" aria-labelledby="rail-availability">
      <h2 id="rail-availability" class={sectionHeadingClass}>
        Availability
      </h2>
      <p class={sectionBodyClass}>{CONTACT_AVAILABILITY}</p>
    </section>

    <section class="vk-rail-module" aria-labelledby="rail-quick-links">
      <h2 id="rail-quick-links" class={sectionHeadingClass}>
        Quick links
      </h2>
      <RailLinkList links={CONTACT_QUICK_LINKS} />
    </section>
  </div>
);

/**
 * Context Rail body: Work Case sections when a case is active; About Mode
 * Availability → Facts → Elsewhere on `/` and `/about`; thin Resume links/hire on
 * `/resume`; Contact availability + quick links on `/contact`; otherwise Mode placeholder.
 */
export const ContextRail: Component = () => {
  const location = useLocation();
  const pathname = () => location.pathname;
  const activeCase = () => getWorkCaseFromPath(pathname());
  const modeId = () => modeForPath(pathname())?.id;

  return (
    <Switch
      fallback={
        <p class="m-0 p-2 text-xs leading-[1.45] text-faint">
          Context follows the active Mode or Work Case.
        </p>
      }
    >
      <Match when={modeId() === "about"}>
        <AboutContext />
      </Match>
      <Match when={modeId() === "resume"}>
        <ResumeContext />
      </Match>
      <Match when={modeId() === "contact"}>
        <ContactContext />
      </Match>
      <Match when={activeCase()}>{(workCase) => <WorkCaseContext workCase={workCase()} />}</Match>
    </Switch>
  );
};
