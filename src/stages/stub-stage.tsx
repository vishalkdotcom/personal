import type { Component } from "solid-js";

type StubStageProps = {
  label: string;
  detail?: string;
};

/** Labeled placeholder for a Mode / Work surface until a later ticket fills it. */
export const StubStage: Component<StubStageProps> = (props) => (
  <section aria-label={props.label}>
    <h1 class="mb-2 mt-0 text-[22px] font-[650] tracking-[-0.03em]">
      {props.label}
    </h1>
    {props.detail ? (
      <p class="m-0 max-w-[52ch] leading-normal text-muted">{props.detail}</p>
    ) : null}
  </section>
);
