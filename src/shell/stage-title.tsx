import { type ParentComponent } from "solid-js";

/** Locked ~28px stage title scale. */
export const STAGE_TITLE_CLASS =
  "m-0 mb-2.5 text-[28px] font-[650] tracking-[-0.03em] leading-[1.15]";

/** Locked ~32px About-scale title — composes on top of STAGE_TITLE_CLASS. */
export const STAGE_TITLE_LG_CLASS = "mb-3 text-[32px] tracking-[-0.035em] leading-[1.1]";

/** Primary stage heading with locked title scale. */
export const StageTitle: ParentComponent<{
  size?: "default" | "lg";
  class?: string;
}> = (props) => (
  <h1
    class={[STAGE_TITLE_CLASS, props.size === "lg" ? STAGE_TITLE_LG_CLASS : undefined, props.class]
      .filter(Boolean)
      .join(" ")}
  >
    {props.children}
  </h1>
);
