import { type ParentComponent } from "solid-js";

/** Resume well — token via @theme (`--color-resume-well`). */
export const RESUME_VIEWER_CLASS =
  "flex min-h-0 flex-1 flex-col overflow-auto border-t border-border bg-resume-well";

export const RESUME_TOOLBAR_CLASS =
  "flex shrink-0 items-center justify-start gap-2.5 border-b border-border bg-bg-deep px-3 py-2";

export const RESUME_FILENAME_CLASS = "font-mono text-[11px] text-muted";

/** Framed PDF plate — shadow token via @theme (`--shadow-resume`). */
export const RESUME_FRAME_CLASS =
  "mx-auto my-4 flex min-h-[480px] w-[min(720px,calc(100%-32px))] flex-1 flex-col overflow-hidden rounded bg-bg-panel shadow-resume";

export const RESUME_EMBED_CLASS = "h-full min-h-0 w-full flex-1 border-0 bg-bg-panel";

export const ResumeViewer: ParentComponent<{
  class?: string;
  "aria-label"?: string;
}> = (props) => (
  <div
    role="region"
    aria-label={props["aria-label"]}
    class={[RESUME_VIEWER_CLASS, props.class].filter(Boolean).join(" ")}
  >
    {props.children}
  </div>
);

export const ResumeToolbar: ParentComponent<{ class?: string }> = (props) => (
  <div class={[RESUME_TOOLBAR_CLASS, props.class].filter(Boolean).join(" ")}>{props.children}</div>
);

export const ResumeFilename: ParentComponent<{ class?: string }> = (props) => (
  <span class={[RESUME_FILENAME_CLASS, props.class].filter(Boolean).join(" ")}>
    {props.children}
  </span>
);

export const ResumeFrame: ParentComponent<{ class?: string }> = (props) => (
  <div class={[RESUME_FRAME_CLASS, props.class].filter(Boolean).join(" ")}>{props.children}</div>
);
