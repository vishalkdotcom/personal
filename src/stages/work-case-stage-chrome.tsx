import { For, Show, type Component, type ParentComponent } from "solid-js";
import { StageTitle } from "../shell/stage-title";
import type {
  WorkArtifact,
  WorkBadge,
  WorkCase,
  WorkFolder,
  WorkImpactMetric,
  WorkOutcome,
} from "../work/inventory";
import { OutcomeLeadLabel } from "../work/outcome-lead-label";

/**
 * Spec-locked ~640–680px stage proof measure — lede, outcomes, artifacts, metrics, carousel.
 * Tailwind only (no new presentational globals).
 */
export const STAGE_PROOF_MEASURE_CLASS = "max-w-[660px]";

export function workCaseBadgeClass(badge: WorkBadge): string {
  if (badge === "Prototype") {
    return "inline-block rounded-full bg-warn-soft px-2 py-0.5 text-[10px] font-[650] tracking-[0.08em] text-warn uppercase";
  }
  return "inline-block rounded-full bg-accent/14 px-2 py-0.5 text-[10px] font-[650] tracking-[0.08em] text-accent uppercase";
}

type WorkCaseHeaderProps = {
  folder: WorkFolder;
  workCase: WorkCase;
  /** Extra bottom margin under the lede before the next stage block. */
  ledeClass?: string;
};

/** Shared badge · folder · title · lede header for Work Case stages. */
export const WorkCaseHeader: Component<WorkCaseHeaderProps> = (props) => (
  <>
    <span class={workCaseBadgeClass(props.workCase.badge)}>{props.workCase.badge}</span>
    <p class="mb-2 mt-2 text-[11px] tracking-[0.12em] text-faint uppercase">{props.folder.title}</p>
    <StageTitle>{props.workCase.title}</StageTitle>
    <p
      class={
        props.ledeClass ??
        `m-0 mb-5 ${STAGE_PROOF_MEASURE_CLASS} text-[15px] leading-[1.55] text-muted`
      }
    >
      {props.workCase.lede}
    </p>
  </>
);

type WorkOutcomesListProps = {
  outcomes: WorkOutcome[];
};

/** Proof-first Outcomes list shared by Public Storefront and Internal Dossier stages. */
export const WorkOutcomesList: Component<WorkOutcomesListProps> = (props) => (
  <ul class={`mb-5 grid ${STAGE_PROOF_MEASURE_CLASS} list-none gap-2 p-0`} aria-label="Outcomes">
    <For each={props.outcomes}>
      {(outcome) => (
        <li class="rounded-lg border border-border bg-bg-deep px-3 py-2.5 text-[12.5px] leading-[1.4] text-muted">
          <OutcomeLeadLabel label={outcome.label} />
          {outcome.text}
        </li>
      )}
    </For>
  </ul>
);

type WorkImpactMetricsProps = {
  metrics: WorkImpactMetric[];
  footnote?: string;
};

/** Tier A impact metrics 3-up — Engage reporting only until a Spec unlocks others. */
export const WorkImpactMetrics: Component<WorkImpactMetricsProps> = (props) => (
  <section class={`mb-5 ${STAGE_PROOF_MEASURE_CLASS}`} aria-label="Impact metrics">
    <div class="grid grid-cols-3 gap-2.5">
      <For each={props.metrics}>
        {(metric) => (
          <div class="rounded-[10px] border border-border bg-bg-deep px-3 py-3">
            <p class="m-0 text-[18px] font-semibold leading-tight tracking-tight text-fg">
              {metric.value}
            </p>
            <p class="m-0 mt-1.5 text-[11px] leading-[1.35] text-muted">{metric.label}</p>
          </div>
        )}
      </For>
    </div>
    <Show when={props.footnote}>
      {(footnote) => <p class="m-0 mt-2.5 text-[11px] leading-[1.4] text-faint">{footnote()}</p>}
    </Show>
  </section>
);

type WorkArtifactsListProps = {
  artifacts: WorkArtifact[];
};

/** Distinct artifact beats under outcomes (callouts + access-description). */
export const WorkArtifactsList: Component<WorkArtifactsListProps> = (props) => (
  <section class={`mb-5 grid ${STAGE_PROOF_MEASURE_CLASS} gap-2.5`} aria-label="Artifacts">
    <For each={props.artifacts}>
      {(artifact) => (
        <div class="rounded-[10px] border border-border bg-bg-deep px-4 py-3.5">
          <h2 class="mb-2 text-[11px] tracking-[0.08em] text-faint uppercase">{artifact.title}</h2>
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
);

export const WorkCaseArticle: ParentComponent<{ label: string }> = (props) => (
  <article aria-label={props.label}>{props.children}</article>
);
