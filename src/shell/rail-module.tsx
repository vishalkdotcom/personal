import { type ParentComponent } from "solid-js";

/** Context Rail column: stacked discrete modules (shell-round-4 / 6 / 9). */
export const RAIL_STACK_CLASS = "flex flex-col gap-2";

/** Bordered inspector module chrome — Tailwind utilities, not a global class. */
export const RAIL_MODULE_CLASS = "m-0 rounded-lg border border-border bg-bg-panel p-3";

export const RailStack: ParentComponent<{ class?: string }> = (props) => (
  <div data-rail-stack="" class={[RAIL_STACK_CLASS, props.class].filter(Boolean).join(" ")}>
    {props.children}
  </div>
);

export const RailModule: ParentComponent<{
  class?: string;
  "aria-labelledby"?: string;
}> = (props) => (
  <section
    data-rail-module=""
    aria-labelledby={props["aria-labelledby"]}
    class={[RAIL_MODULE_CLASS, props.class].filter(Boolean).join(" ")}
  >
    {props.children}
  </section>
);
