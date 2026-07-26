import { For, Show, type Component } from "solid-js";
import type { InternalDossierCase, WorkFolder } from "../work/inventory";
import { MediaCarousel } from "./media-carousel";
import { WorkCaseArticle, WorkCaseHeader, WorkOutcomesList } from "./work-case-stage-chrome";

type InternalDossierStageProps = {
  folder: WorkFolder;
  workCase: InternalDossierCase;
};

/**
 * Internal Dossier stage — proof-first outcomes, artifact blocks, then supporting media
 * when wired. Preview stays off at the App Shell seam. Metrics stay out until a Tier A
 * numeric claim exists (no invented interview-only numbers).
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
        ledeClass="m-0 mb-4 max-w-[52ch] text-[15px] leading-[1.55] text-muted"
      />

      <p
        class="mb-5 flex max-w-[640px] items-start gap-2 rounded-lg bg-warn-soft px-3 py-2.5 text-[12px] leading-[1.4] text-warn"
        role="note"
      >
        Internal / auth-walled — dossier layout with outcomes and artifacts; Preview stays off.
      </p>

      <WorkOutcomesList outcomes={props.workCase.outcomes} />

      <Show when={artifacts().length > 0}>
        <section class="mb-5 grid max-w-[680px] gap-2.5" aria-label="Artifacts">
          <For each={artifacts()}>
            {(artifact) => (
              <div class="rounded-[10px] border border-border bg-bg-deep px-4 py-3.5">
                <h2 class="mb-2 text-[11px] tracking-[0.08em] text-faint uppercase">
                  {artifact.title}
                </h2>
                <Show
                  when={artifact.emphasis === "callout"}
                  fallback={<p class="m-0 text-[13px] leading-[1.5] text-muted">{artifact.body}</p>}
                >
                  <p class="m-0 border-l-2 border-accent py-2 pl-3 text-[13px] leading-[1.5] text-muted">
                    {artifact.body}
                  </p>
                </Show>
              </div>
            )}
          </For>
        </section>
      </Show>

      <Show when={showMedia() ? props.workCase.slug : undefined} keyed>
        <MediaCarousel slides={slides()} />
      </Show>
    </WorkCaseArticle>
  );
};
