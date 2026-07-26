import { For, type Component, type ParentComponent } from "solid-js";
import type { WorkBadge, WorkCase, WorkFolder } from "../work/inventory";

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
    <h1 class="vk-stage-title">{props.workCase.title}</h1>
    <p class={props.ledeClass ?? "m-0 mb-5 max-w-[52ch] text-[15px] leading-[1.55] text-muted"}>
      {props.workCase.lede}
    </p>
  </>
);

type WorkOutcomesListProps = {
  outcomes: string[];
};

/** Proof-first Outcomes list shared by Public Storefront and Internal Dossier stages. */
export const WorkOutcomesList: Component<WorkOutcomesListProps> = (props) => (
  <ul class="mb-5 grid max-w-[640px] list-none gap-2 p-0" aria-label="Outcomes">
    <For each={props.outcomes}>
      {(outcome) => (
        <li class="rounded-lg border border-border bg-bg-deep px-3 py-2.5 text-[12.5px] leading-[1.4] text-muted">
          {outcome}
        </li>
      )}
    </For>
  </ul>
);

export const WorkCaseArticle: ParentComponent<{ label: string }> = (props) => (
  <article aria-label={props.label}>{props.children}</article>
);
