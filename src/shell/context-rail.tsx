import { A, useLocation } from "@solidjs/router";
import { For, Show, type Component } from "solid-js";
import { getWorkCaseFromPath, type WorkCase } from "../work/inventory";

const sectionHeadingClass = "m-0 text-[11px] font-[650] tracking-[0.06em] text-faint uppercase";

const sectionBodyClass = "m-0 mt-1.5 text-[12.5px] leading-[1.45] text-muted";

const ctaClass =
  "inline-flex items-center justify-center rounded-md border border-border bg-bg-panel px-2.5 py-1.5 text-[12px] font-medium text-fg hover:bg-bg-hover";

const WorkCaseContext: Component<{ workCase: WorkCase }> = (props) => (
  <div class="flex flex-col gap-4 p-2">
    <section aria-labelledby="rail-availability">
      <h2 id="rail-availability" class={sectionHeadingClass}>
        Availability
      </h2>
      <p class={sectionBodyClass}>Open to roles · Senior FE</p>
      <A href="/contact" class={`${ctaClass} mt-2`}>
        Open to roles
      </A>
    </section>

    <section aria-labelledby="rail-live">
      <h2 id="rail-live" class={sectionHeadingClass}>
        Live
      </h2>
      <p class={sectionBodyClass}>{props.workCase.live}</p>
    </section>

    <section aria-labelledby="rail-role">
      <h2 id="rail-role" class={sectionHeadingClass}>
        Role
      </h2>
      <p class={sectionBodyClass}>{props.workCase.role}</p>
    </section>

    <section aria-labelledby="rail-outcomes">
      <h2 id="rail-outcomes" class={sectionHeadingClass}>
        Outcomes
      </h2>
      <ul class="m-0 mt-1.5 list-none space-y-1.5 p-0 text-[12.5px] leading-[1.45] text-muted">
        <For each={props.workCase.outcomes}>{(outcome) => <li>{outcome}</li>}</For>
      </ul>
    </section>

    <section aria-labelledby="rail-stack">
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

    <div class="border-t border-border pt-3">
      <A href="/contact" class={`${ctaClass} w-full`} aria-label="Get in touch">
        Get in touch
      </A>
    </div>
  </div>
);

/**
 * Context Rail body: Work Case sections in locked order when a case is active.
 * Mode-specific rail bodies ship in later tickets.
 */
export const ContextRail: Component = () => {
  const location = useLocation();
  const activeCase = () => getWorkCaseFromPath(location.pathname);

  return (
    <Show
      when={activeCase()}
      fallback={
        <p class="m-0 p-2 text-xs leading-[1.45] text-faint">
          Context follows the active Mode or Work Case.
        </p>
      }
    >
      {(workCase) => <WorkCaseContext workCase={workCase()} />}
    </Show>
  );
};
