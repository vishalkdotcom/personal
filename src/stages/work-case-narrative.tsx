import { Show, type Component } from "solid-js";
import type { PublicStorefrontCase, WorkFolder } from "../work/inventory";
import { MediaCarousel } from "./media-carousel";
import { WorkCaseArticle, WorkCaseHeader, WorkOutcomesList } from "./work-case-stage-chrome";

type WorkCaseNarrativeProps = {
  folder: WorkFolder;
  workCase: PublicStorefrontCase;
};

/**
 * Public Storefront stage: badge · folder · title · lede · outcomes · media carousel.
 * Internal Dossiers use InternalDossierStage instead.
 */
export const WorkCaseNarrative: Component<WorkCaseNarrativeProps> = (props) => {
  const slides = () => props.workCase.media ?? [];
  /** Show carousel when the case has wired media slides. */
  const showMedia = () => slides().length > 0;

  return (
    <WorkCaseArticle label={`${props.workCase.title} Public Storefront`}>
      <WorkCaseHeader folder={props.folder} workCase={props.workCase} />
      <WorkOutcomesList outcomes={props.workCase.outcomes} />
      <Show when={showMedia() ? props.workCase.slug : undefined} keyed>
        <MediaCarousel slides={slides()} />
      </Show>
    </WorkCaseArticle>
  );
};
