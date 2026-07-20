import type { Component } from "solid-js";
import { RESUME_PDF_HREF, RESUME_PDF_TITLE } from "../resume/content";

/**
 * Resume Surface center: embedded PDF viewer (PDF is SoT — no HTML CV rebuild).
 */
export const ResumeStage: Component = () => (
  <article
    aria-label="Resume Surface"
    class="-mx-9 -my-7 flex h-[calc(100%+3.5rem)] min-h-0 flex-col"
  >
    <iframe
      src={RESUME_PDF_HREF}
      title={RESUME_PDF_TITLE}
      class="h-full min-h-[70vh] w-full flex-1 border-0 bg-bg-deep"
    />
  </article>
);
