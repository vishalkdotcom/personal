import { A, useLocation } from "@solidjs/router";
import { For, Match, Show, Switch, type Component } from "solid-js";
import { ABOUT_ELSEWHERE, ABOUT_FACTS, HIRE_SIGNAL_DETAIL } from "../about/content";
import { CONTACT_QUICK_LINKS } from "../contact/content";
import { RESUME_LINKS } from "../resume/content";
import {
  getWorkCaseFromPath,
  isHttpLiveUrl,
  workCaseLiveUrl,
  workInventoryStackUnion,
  type WorkCase,
} from "../work/inventory";
import { modeForPath } from "./modes";
import { isHireSignalEnabled } from "./hire-signal";
import { RailModule, RailStack } from "./rail-module";

const sectionHeadingClass = "m-0 text-[11px] font-[650] tracking-[0.06em] text-faint uppercase";

const sectionBodyClass = "m-0 mt-1.5 text-[12.5px] leading-[1.45] text-muted";

const ctaClass =
  "inline-flex items-center justify-center rounded-md border border-border bg-bg-panel px-2.5 py-1.5 text-[12px] font-medium text-fg hover:bg-bg-hover";

/** Soft accent hire CTA (shell-round-9) — panel + Work Case footer. */
const softHireCtaClass =
  "inline-flex items-center justify-center rounded-md bg-accent/14 px-2.5 py-1.5 text-[12px] font-medium text-accent hover:bg-accent/20";

const linkClass = "text-accent underline-offset-2 hover:underline";

const stackChipClass = "rounded-md bg-bg-active px-1.5 py-0.5 text-[11px] text-muted";

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
        <a
          href={href()}
          class={linkClass}
          target="_blank"
          rel={
            href() === "https://www.linkedin.com/in/vishalkdotcom" ||
            href() === "https://github.com/vishalkdotcom"
              ? "me noreferrer"
              : "noreferrer"
          }
        >
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

const StackChips: Component<{ items: readonly string[] }> = (props) => (
  <ul class="m-0 mt-1.5 flex list-none flex-wrap gap-1.5 p-0">
    <For each={[...props.items]}>{(item) => <li class={stackChipClass}>{item}</li>}</For>
  </ul>
);

/**
 * Desktop Hire Signal soft accent panel (shell-round-9): status-dot + Open to roles + soft CTA.
 * Contact Mode renders it ungated without the CTA — the stage is already the contact surface.
 */
const HireSignalPanel: Component<{ gated?: boolean; withCta?: boolean }> = (props) => {
  const visible = () => props.gated === false || isHireSignalEnabled();
  return (
    <Show when={visible()}>
      <section
        class="rounded-lg border border-accent/15 bg-accent-soft p-3"
        aria-labelledby="rail-hire-signal"
      >
        <h2
          id="rail-hire-signal"
          class="m-0 mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-accent"
        >
          <span class="size-[7px] shrink-0 rounded-full bg-ok" aria-hidden="true" />
          Open to roles
        </h2>
        <p class="m-0 mb-2.5 text-[12px] leading-[1.45] text-muted">{HIRE_SIGNAL_DETAIL}</p>
        <Show when={props.withCta !== false}>
          <A href="/contact" class={softHireCtaClass}>
            Get in touch
          </A>
        </Show>
      </section>
    </Show>
  );
};

/** Work Case footer hire CTA removed (2026-07-29 amendment) — the soft panel carries the hire action. */

/** Work Case rail: Hire Signal → Live (when present) → Role → Stack. Stage owns Outcomes. */
const WorkCaseContext: Component<{ workCase: WorkCase }> = (props) => {
  const liveUrl = () => {
    const url = workCaseLiveUrl(props.workCase);
    return isHttpLiveUrl(url) ? url : undefined;
  };

  return (
    <RailStack>
      <HireSignalPanel />

      <Show when={liveUrl()}>
        {(live) => (
          <RailModule aria-labelledby="rail-live">
            <h2 id="rail-live" class={sectionHeadingClass}>
              Live
            </h2>
            <a href={live()} class={`${ctaClass} mt-2`} target="_blank" rel="noreferrer">
              Open live ↗
            </a>
            <p class="m-0 mt-1.5 text-[12px] leading-[1.45] text-faint">
              {live().replace(/^https?:\/\//i, "")}
            </p>
          </RailModule>
        )}
      </Show>

      <RailModule aria-labelledby="rail-role">
        <h2 id="rail-role" class={sectionHeadingClass}>
          Role
        </h2>
        <p class={sectionBodyClass}>{props.workCase.role}</p>
      </RailModule>

      <RailModule aria-labelledby="rail-stack">
        <h2 id="rail-stack" class={sectionHeadingClass}>
          Stack
        </h2>
        <StackChips items={props.workCase.stack} />
      </RailModule>
    </RailStack>
  );
};

/** About Mode rail: Hire Signal soft panel → Facts → Elsewhere (shell-round-9 A). */
const AboutContext: Component = () => (
  <RailStack>
    <HireSignalPanel />

    <RailModule aria-labelledby="rail-facts">
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
    </RailModule>

    <RailModule aria-labelledby="rail-elsewhere">
      <h2 id="rail-elsewhere" class={sectionHeadingClass}>
        Elsewhere
      </h2>
      <RailLinkList links={ABOUT_ELSEWHERE} />
    </RailModule>
  </RailStack>
);

/** Resume Mode thin rail: Hire Signal soft panel → Links (PDF download + elsewhere). */
const ResumeContext: Component = () => (
  <RailStack>
    <HireSignalPanel />

    <RailModule aria-labelledby="rail-links">
      <h2 id="rail-links" class={sectionHeadingClass}>
        Links
      </h2>
      <RailLinkList links={RESUME_LINKS} />
    </RailModule>
  </RailStack>
);

/** Contact Mode rail: soft hire panel (ungated, no CTA) + email / LinkedIn / GitHub / CV. */
const ContactContext: Component = () => (
  <RailStack>
    <HireSignalPanel gated={false} withCta={false} />

    <RailModule aria-labelledby="rail-quick-links">
      <h2 id="rail-quick-links" class={sectionHeadingClass}>
        Quick links
      </h2>
      <RailLinkList links={CONTACT_QUICK_LINKS} />
    </RailModule>
  </RailStack>
);

/** Work index rail: Hire Signal + aggregate Stack (no Browse filler). */
const WorkIndexContext: Component = () => (
  <RailStack>
    <HireSignalPanel />

    <RailModule aria-labelledby="rail-stack">
      <h2 id="rail-stack" class={sectionHeadingClass}>
        Stack
      </h2>
      <StackChips items={workInventoryStackUnion()} />
    </RailModule>
  </RailStack>
);

/**
 * Context Rail body: Work Case Hire Signal → Live → Role → Stack when a case is active;
 * Hire Signal + aggregate Stack on `/work`; About Hire Signal → Facts → Elsewhere; thin Resume
 * links/hire; Contact availability + quick links.
 */
export const ContextRail: Component = () => {
  const location = useLocation();
  const pathname = () => location.pathname;
  const activeCase = () => getWorkCaseFromPath(pathname());
  const modeId = () => modeForPath(pathname())?.id;

  return (
    <Switch>
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
      <Match when={modeId() === "work"}>
        <WorkIndexContext />
      </Match>
    </Switch>
  );
};
