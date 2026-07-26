import type { Component } from "solid-js";
import { RESUME_PDF_FILENAME, RESUME_PDF_HREF, RESUME_PDF_TITLE } from "../resume/content";

/**
 * Resume Surface center: framed embedded PDF viewer (PDF is SoT — no HTML CV rebuild).
 * Bleed cancels App Shell stage padding via `.vk-stage-bleed`.
 */
export const ResumeStage: Component = () => (
  <article aria-label="Resume Surface" class="vk-stage-bleed">
    <div class="vk-resume-viewer" role="region" aria-label="Resume viewer">
      <div class="vk-resume-toolbar">
        <span class="vk-resume-filename">{RESUME_PDF_FILENAME}</span>
      </div>
      <div class="vk-resume-frame">
        <iframe src={RESUME_PDF_HREF} title={RESUME_PDF_TITLE} class="vk-resume-embed" />
      </div>
    </div>
  </article>
);
