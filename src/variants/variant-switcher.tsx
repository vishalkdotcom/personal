import { For, createSignal, onSettled, type Component } from "solid-js";
import { SITE_VARIANTS, useSiteVariant, type SiteVariantId } from "./variant-store";

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target.isContentEditable;
}

/**
 * Compact header/floating edition switcher (01 Synth · 02 Cosmos · 03 Arcade · 04 VK-OS · 05 Poster).
 * Supports Alt+1..5 keyboard shortcuts so visitors can compare all 5 creative worlds live.
 */
export const VariantSwitcherBar: Component<{ compact?: boolean }> = (props) => {
  const { variant, setVariant } = useSiteVariant();
  const [copiedLink, setCopiedLink] = createSignal(false);

  onSettled(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (isTypingTarget(event.target)) return;
      if (!event.altKey || event.ctrlKey || event.metaKey) return;
      const map: Record<string, SiteVariantId> = {
        "1": "synth",
        "2": "cosmos",
        "3": "arcade",
        "4": "spatial",
        "5": "brutalist",
      };
      const match = map[event.key];
      if (match) {
        event.preventDefault();
        setVariant(match);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  const copyShareUrl = () => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    url.searchParams.set("v", variant());
    navigator.clipboard?.writeText(url.toString()).catch(() => {});
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 1600);
  };

  return (
    <div
      class="inline-flex items-center gap-1 rounded-lg border border-border bg-bg-deep p-0.5"
      role="group"
      aria-label="Creative world switcher"
      data-variant-switcher=""
    >
      <span class="hidden px-2 font-mono text-[10px] tracking-[0.08em] text-faint uppercase xl:inline">
        World
      </span>
      <For each={[...SITE_VARIANTS]}>
        {(item) => {
          const active = () => variant() === item.id;
          return (
            <button
              type="button"
              onClick={() => setVariant(item.id)}
              aria-pressed={active() ? "true" : "false"}
              title={`${item.num} · ${item.title} (Alt+${item.num.slice(1)})`}
              data-variant-pill={item.id}
              class={[
                "inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] leading-none font-medium transition-colors",
                active()
                  ? "bg-accent/16 text-accent font-semibold shadow-[inset_0_0_0_1px_var(--vk-accent)]"
                  : "text-muted hover:bg-bg-hover hover:text-fg",
              ].join(" ")}
            >
              <span class="font-mono text-[10px] opacity-75">{item.num}</span>
              <span class={props.compact ? "hidden sm:inline" : ""}>{item.shortLabel}</span>
            </button>
          );
        }}
      </For>
      <button
        type="button"
        onClick={copyShareUrl}
        title="Copy direct URL to this world"
        class="hidden rounded-md px-1.5 py-1 font-mono text-[10px] text-faint hover:bg-bg-hover hover:text-fg lg:inline-flex"
      >
        {copiedLink() ? "Copied" : "?v="}
      </button>
    </div>
  );
};
