import { For, Show, type Component } from "solid-js";
import type { WorkBadge, WorkCase, WorkFolder } from "../work/inventory";
import { MediaCarousel } from "./media-carousel";

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
 * Proof-first Work Case stage: badge · folder · title · lede · outcomes · media carousel.
 * Brand stays in App Shell chrome; Public Storefront media defaults to the stage carousel.
 */
export const WorkCaseNarrative: Component<WorkCaseNarrativeProps> = (props) => {
  const surfaceLabel = () =>
    props.workCase.surface === "public-storefront" ? "Public Storefront" : "Internal Dossier";
  const slides = () => props.workCase.media ?? [];
  /** Internal Dossiers omit label-only placeholders; show carousel once slides have src. */
  const showMedia = () => {
    const list = slides();
    if (list.length === 0) return false;
    if (props.workCase.surface === "internal-dossier") {
      return list.some((slide) => Boolean(slide.src));
    }
    return true;
  };

  return (
    <article aria-label={`${props.workCase.title} ${surfaceLabel()}`}>
      <span class={badgeClass(props.workCase.badge)}>{props.workCase.badge}</span>
      <p class="mb-2 mt-2 text-[11px] tracking-[0.12em] text-faint uppercase">
        {props.folder.title}
      </p>
      <h1 class="vk-stage-title">{props.workCase.title}</h1>
      <p class="m-0 mb-5 max-w-[52ch] text-[15px] leading-[1.55] text-muted">
        {props.workCase.lede}
      </p>
      <ul class="mb-5 grid max-w-[640px] list-none gap-2 p-0" aria-label="Outcomes">
        <For each={props.workCase.outcomes}>
          {(outcome) => (
            <li class="rounded-lg border border-border bg-bg-deep px-3 py-2.5 text-[12.5px] leading-[1.4] text-muted">
              {outcome}
            </li>
          )}
        </For>
      </ul>
      <Show when={showMedia()}>
        <MediaCarousel slides={slides()} />
      </Show>
    </article>
  );
};
