import { Show, type Component } from "solid-js";
import { BASED_LOCATION } from "../about/content";
import { ThemeControl } from "../theme/theme-control";
import { ModeNav } from "./mode-nav";
import { WorkTree } from "./work-tree";

/**
 * Optional real-photo WebP URL. Null until an approved photo is committed;
 * monogram VK is the shipped fallback.
 */
const AVATAR_WEBP_SRC: string | null = null;

const LeftChromeAvatar: Component = () => (
  <Show
    when={AVATAR_WEBP_SRC}
    fallback={
      <span
        role="img"
        aria-label="Vishal Kumar"
        class="grid size-7 shrink-0 place-items-center rounded-full bg-bg-active text-[10px] font-[650] tracking-wide text-muted"
      >
        VK
      </span>
    }
  >
    {(src) => (
      <img
        src={src()}
        alt="Vishal Kumar"
        width={28}
        height={28}
        class="size-7 shrink-0 rounded-full object-cover"
      />
    )}
  </Show>
);

/** Pinned identity foot: avatar + location; collapsed rail keeps avatar only. */
const LeftChromeFoot: Component<{ collapsed: boolean }> = (props) => (
  <div
    role="group"
    aria-label="Identity"
    class={[
      "mt-auto flex shrink-0 items-center border-t border-border pt-3",
      props.collapsed ? "-mx-1.5 justify-center px-0" : "-mx-2 gap-2.5 px-4",
    ].join(" ")}
  >
    <LeftChromeAvatar />
    <Show when={!props.collapsed}>
      <span class="min-w-0 truncate text-[11px] text-faint">{BASED_LOCATION}</span>
    </Show>
  </div>
);

/** Shared left IA: brand row + theme, Modes, Work tree, pinned identity foot. */
export const LeftChrome: Component<{ collapsed?: boolean }> = (props) => (
  <div class="flex h-full min-h-0 flex-col">
    <div class="flex items-start justify-between gap-2 p-[4px_8px_14px] group-data-[left-collapsed]/shell:justify-center group-data-[left-collapsed]/shell:p-[4px_0_10px]">
      <div class="group-data-[left-collapsed]/shell:hidden">
        <div class="whitespace-nowrap text-sm font-[650] tracking-[-0.02em]">Vishal Kumar</div>
        <div class="mt-[3px] whitespace-nowrap text-[11px] text-faint">
          Senior FE · Complex product UI
        </div>
      </div>
      <ThemeControl />
    </div>
    <ModeNav />
    <WorkTree />
    <LeftChromeFoot collapsed={props.collapsed === true} />
  </div>
);
