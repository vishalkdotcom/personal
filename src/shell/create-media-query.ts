import { createSignal, onSettled } from "solid-js";

/** Reactive `window.matchMedia` match — CSR only. */
export function createMediaQuery(query: string) {
  const getMatches = () =>
    typeof window !== "undefined" && typeof window.matchMedia === "function"
      ? window.matchMedia(query).matches
      : false;

  const [matches, setMatches] = createSignal(getMatches());

  onSettled(() => {
    const media = window.matchMedia(query);
    const sync = () => setMatches(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  });

  return matches;
}

/** Mobile App Shell breakpoint — Triptych Dock above this width. */
export const MOBILE_SHELL_QUERY = "(max-width: 767px)";
