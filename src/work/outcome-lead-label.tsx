import type { Component } from "solid-js";

/** Accent Outcome lead-label before claim text (stage + Context Rail). */
export const OutcomeLeadLabel: Component<{ label: string }> = (props) => (
  <strong class="mr-1.5 font-semibold text-accent">{props.label}</strong>
);
