import { Show, type Component } from "solid-js";
import type { InternalDossierCase, WorkFolder } from "../work/inventory";
import { MediaCarousel } from "./media-carousel";
import {
  STAGE_PROOF_MEASURE_CLASS,
  WorkArtifactsList,
  WorkCaseArticle,
  WorkCaseHeader,
  WorkImpactMetrics,
  WorkOutcomesList,
} from "./work-case-stage-chrome";

type InternalDossierStageProps = {
  folder: WorkFolder;
  workCase: InternalDossierCase;
};

/**
 * Internal Dossier stage — optional Spec-locked metrics, proof-first outcomes,
 * distinct artifacts, then supporting media. No auth-walled apology note.
 */
export const InternalDossierStage: Component<InternalDossierStageProps> = (props) => {
  const slides = () => props.workCase.media ?? [];
  const showMedia = () => slides().length > 0;
  const artifacts = () => props.workCase.artifacts ?? [];
  const metrics = () => props.workCase.metrics ?? [];

  return (
    <WorkCaseArticle label={`${props.workCase.title} Internal Dossier`}>
      <WorkCaseHeader
        folder={props.folder}
        workCase={props.workCase}
        ledeClass={`m-0 mb-4 ${STAGE_PROOF_MEASURE_CLASS} text-[15px] leading-[1.55] text-muted`}
      />

      <Show when={metrics().length > 0}>
        <WorkImpactMetrics metrics={metrics()} footnote={props.workCase.metricsFootnote} />
      </Show>

      <WorkOutcomesList outcomes={props.workCase.outcomes} />

      <Show when={artifacts().length > 0}>
        <WorkArtifactsList artifacts={artifacts()} />
      </Show>

      <Show when={showMedia() ? props.workCase.slug : undefined} keyed>
        <MediaCarousel slides={slides()} />
      </Show>
    </WorkCaseArticle>
  );
};
