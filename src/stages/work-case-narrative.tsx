import { For, type Component } from "solid-js";
import type { WorkBadge, WorkCase, WorkFolder } from "../work/inventory";

function badgeClass(badge: WorkBadge): string {
  if (badge === "Prototype") {
    return "inline-block rounded-full bg-[rgba(232,168,124,0.16)] px-2 py-0.5 text-[10px] font-[650] tracking-[0.08em] text-[#e8a87c] uppercase";
  }
  return "inline-block rounded-full bg-accent/14 px-2 py-0.5 text-[10px] font-[650] tracking-[0.08em] text-accent uppercase";
}

type WorkCaseNarrativeProps = {
  folder: WorkFolder;
  workCase: WorkCase;
};

/**
 * Proof-first Work Case stage: badge · folder · title · lede · outcomes · media.
 * Brand stays in App Shell chrome; ticket 06 allows placeholder media for SupplyChain+.
 */
export const WorkCaseNarrative: Component<WorkCaseNarrativeProps> = (props) => {
  const surfaceLabel = () =>
    props.workCase.surface === "public-storefront" ? "Public Storefront" : "Internal Dossier";

  return (
    <article aria-label={`${props.workCase.title} ${surfaceLabel()}`}>
      <span class={badgeClass(props.workCase.badge)}>{props.workCase.badge}</span>
      <p class="mb-1.5 mt-2 text-[10px] tracking-[0.12em] text-faint uppercase">
        {props.folder.title}
      </p>
      <h1 class="mb-2 mt-0 text-[22px] font-[650] tracking-[-0.03em]">{props.workCase.title}</h1>
      <p class="m-0 mb-3.5 max-w-[52ch] text-sm leading-normal text-muted">{props.workCase.lede}</p>
      <ul class="mb-3.5 grid max-w-[640px] list-none gap-2 p-0" aria-label="Outcomes">
        <For each={props.workCase.outcomes}>
          {(outcome) => (
            <li class="rounded-lg border border-border bg-bg-deep px-3 py-2.5 text-[12.5px] leading-[1.4] text-muted">
              {outcome}
            </li>
          )}
        </For>
      </ul>
      <div
        class="grid aspect-[16/10] place-items-end justify-items-start rounded-xl border border-border bg-[radial-gradient(ellipse_at_20%_20%,rgba(108,182,255,0.2),transparent_50%),linear-gradient(160deg,#1e2430,#141820)] p-2.5 text-[11px] text-faint"
        aria-label="Media placeholder"
      >
        Media placeholder
      </div>
    </article>
  );
};
