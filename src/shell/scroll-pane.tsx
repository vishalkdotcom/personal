import { type ParentComponent } from "solid-js";

/**
 * Theme-token scrollbar exception class — the only presentational `vk-*` kept in
 * styles.css (webkit scrollbar pseudos cannot be Tailwind utilities).
 */
export const SCROLL_PANE_CLASS = "vk-scroll";

/** Scroll pane div: composes the scrollbar CSS exception with caller layout utilities. */
export const ScrollPane: ParentComponent<{ class?: string }> = (props) => (
  <div class={[SCROLL_PANE_CLASS, props.class].filter(Boolean).join(" ")}>{props.children}</div>
);
