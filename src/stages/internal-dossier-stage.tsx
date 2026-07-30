import { Show, type Component } from "solid-js";
import type { InternalDossierCase, WorkFolder } from "../work/inventory";
import { MediaCarousel } from "./media-carousel";
import {
  STAGE_PROOF_MEASURE_CLASS,
  WorkArtifactsList,
  WorkCaseArticle,
  WorkCaseHeader,
  WorkOutcomesList,
} from "./work-case-stage-chrome";

type InternalDossierStageProps = {
  folder: WorkFolder;
  workCase: InternalDossierCase;
};

/**
 * Internal Dossier stage — proof-first outcomes, distinct artifacts when present,
 * then supporting media. No auth-walled apology note; no impact-metrics row.
 */
export const InternalDossierStage: Component<InternalDossierStageProps> = (props) => {
  const slides = () => props.workCase.media ?? [];
  const showMedia = () => slides().length > 0;
  const artifacts = () => props.workCase.artifacts ?? [];

  return (
    <WorkCaseArticle label={`${props.workCase.title} Internal Dossier`}>
      <WorkCaseHeader
        folder={props.folder}
        workCase={props.workCase}
        ledeClass={`m-0 mb-4 ${STAGE_PROOF_MEASURE_CLASS} text-[15px] leading-[1.55] text-muted`}
      />

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
