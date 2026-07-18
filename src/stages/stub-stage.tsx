import type { Component } from "solid-js";

type StubStageProps = {
  label: string;
  detail?: string;
};

/** Labeled placeholder for a Mode / Work surface until a later ticket fills it. */
export const StubStage: Component<StubStageProps> = (props) => (
  <section class="stub-stage" aria-label={props.label}>
    <h1 class="stub-stage__title">{props.label}</h1>
    {props.detail ? <p class="stub-stage__detail">{props.detail}</p> : null}
  </section>
);
