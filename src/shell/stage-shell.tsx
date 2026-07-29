import { type ParentComponent } from "solid-js";
import { SCROLL_PANE_CLASS } from "./scroll-pane";

export type StageDensity = "desktop" | "mobile";

/** Desktop stage padding rhythm (shell-round-4 / 6). */
export const STAGE_SHELL_DESKTOP_CLASS = "p-[28px_36px_100px]";

/** Mobile stage padding rhythm. */
export const STAGE_SHELL_MOBILE_CLASS = "p-[20px_16px_64px]";

/**
 * Full-bleed child (Resume PDF): cancels parent StageShell padding via `data-stage`
 * + Tailwind `in-*` variants — no presentational global.
 */
export const STAGE_BLEED_CLASS = [
  "flex min-h-0 flex-col",
  "in-[[data-stage=desktop]]:m-[-28px_-36px_-100px] in-[[data-stage=desktop]]:h-[calc(100%+128px)]",
  "in-[[data-stage=mobile]]:m-[-20px_-16px_-64px] in-[[data-stage=mobile]]:h-[calc(100%+84px)]",
].join(" ");

type StageShellProps = {
  density: StageDensity;
  class?: string;
  id?: string;
};

/** Center stage surface: scroll chrome + locked padding rhythm. */
export const StageShell: ParentComponent<StageShellProps> = (props) => {
  const padClass = () =>
    props.density === "desktop" ? STAGE_SHELL_DESKTOP_CLASS : STAGE_SHELL_MOBILE_CLASS;

  return (
    <main
      id={props.id ?? "stage"}
      data-stage={props.density}
      class={[SCROLL_PANE_CLASS, padClass(), props.class].filter(Boolean).join(" ")}
    >
      {props.children}
    </main>
  );
};

/** Bleed wrapper that cancels StageShell padding for full-bleed surfaces. */
export const StageBleed: ParentComponent<{
  class?: string;
  "aria-label"?: string;
}> = (props) => (
  <article
    aria-label={props["aria-label"]}
    data-stage-bleed=""
    class={[STAGE_BLEED_CLASS, props.class].filter(Boolean).join(" ")}
  >
    {props.children}
  </article>
);
