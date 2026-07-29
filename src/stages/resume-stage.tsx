import type { Component } from "solid-js";
import { RESUME_PDF_FILENAME, RESUME_PDF_HREF, RESUME_PDF_TITLE } from "../resume/content";
import { StageBleed } from "../shell/stage-shell";
import {
  RESUME_EMBED_CLASS,
  ResumeFilename,
  ResumeFrame,
  ResumeToolbar,
  ResumeViewer,
} from "./resume-viewer";

/**
 * Resume Surface center: framed embedded PDF viewer (PDF is SoT — no HTML CV rebuild).
 * Bleed cancels App Shell stage padding via StageBleed / StageShell data-stage.
 */
export const ResumeStage: Component = () => (
  <StageBleed aria-label="Resume Surface">
    <ResumeViewer aria-label="Resume viewer">
      <ResumeToolbar>
        <ResumeFilename>{RESUME_PDF_FILENAME}</ResumeFilename>
      </ResumeToolbar>
      <ResumeFrame>
        <iframe src={RESUME_PDF_HREF} title={RESUME_PDF_TITLE} class={RESUME_EMBED_CLASS} />
      </ResumeFrame>
    </ResumeViewer>
  </StageBleed>
);
