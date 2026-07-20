import type { Component } from "solid-js";
import { ThemeControl } from "../theme/theme-control";
import { ModeNav } from "./mode-nav";
import { WorkTree } from "./work-tree";

/** Shared left IA: brand row + theme, Modes, Work tree. */
export const LeftChrome: Component = () => (
  <>
    <div class="flex items-start justify-between gap-2 p-[4px_8px_14px] group-data-[left-collapsed]/shell:justify-center group-data-[left-collapsed]/shell:p-[4px_0_10px]">
      <div class="group-data-[left-collapsed]/shell:hidden">
        <div class="whitespace-nowrap text-sm font-[650] tracking-[-0.02em]">Vishal Kumar</div>
        <div class="mt-[3px] whitespace-nowrap text-[11px] text-faint">
          Senior FE · Reporting UIs
        </div>
      </div>
      <ThemeControl />
    </div>
    <ModeNav />
    <WorkTree />
  </>
);
