import { A } from "@solidjs/router";
import { Show, createSignal, type Component } from "solid-js";
import {
  HIRE_SIGNAL_CHIP_BLURB,
  isHireSignalEnabled,
  isHireSignalSnoozed,
  snoozeHireSignal,
} from "./hire-signal";

/**
 * Mobile floating Hire Signal (shell-round-17 D): compact chip → expand Get in touch + Snooze.
 * Desktop Context Rail hire CTA is separate and never snoozes.
 */
export const HireSignalChip: Component = () => {
  const [expanded, setExpanded] = createSignal(false);
  const [snoozed, setSnoozed] = createSignal(isHireSignalSnoozed());

  const visible = () => isHireSignalEnabled() && !snoozed();

  return (
    <Show when={visible()}>
      <div class="absolute right-3.5 bottom-4 z-[22] flex flex-col items-end gap-2">
        <Show when={expanded()}>
          <div class="w-[220px] rounded-[14px] border border-border bg-bg-deep p-3 shadow-[0_12px_32px_rgba(0,0,0,0.4)]">
            <h2 class="m-0 mb-1 flex items-center gap-1.5 text-xs font-[650] text-accent">
              <span class="size-[7px] shrink-0 rounded-full bg-ok" aria-hidden="true" />
              Open to roles
            </h2>
            <p class="m-0 mb-2.5 text-[11px] leading-[1.4] text-muted">{HIRE_SIGNAL_CHIP_BLURB}</p>
            <div class="flex gap-1.5">
              <A
                href="/contact"
                class="flex-1 rounded-lg bg-accent/14 px-2 py-2 text-center text-xs font-[650] text-accent hover:bg-accent/20"
                onClick={() => setExpanded(false)}
              >
                Get in touch
              </A>
              <button
                type="button"
                class="rounded-lg border border-border px-2.5 py-2 text-center text-[11px] text-muted"
                onClick={() => {
                  snoozeHireSignal();
                  setSnoozed(true);
                  setExpanded(false);
                }}
              >
                Snooze
              </button>
            </div>
          </div>
        </Show>
        <button
          type="button"
          class="flex items-center gap-2 rounded-full border border-border bg-bg-deep px-3 py-2.5 text-xs font-[650] text-accent shadow-[0_8px_24px_rgba(0,0,0,0.35)]"
          aria-expanded={expanded() ? "true" : "false"}
          onClick={() => setExpanded((value) => !value)}
        >
          <span class="size-[7px] shrink-0 rounded-full bg-ok" aria-hidden="true" />
          Open to roles
        </button>
      </div>
    </Show>
  );
};
