/** Skip carousel/viewer nav keys while typing in form fields. */
export function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || target.isContentEditable;
}

type CarouselNavHandlers = {
  goPrev: () => void;
  goNext: () => void;
  goFirst: () => void;
  goLast: () => void;
};

/**
 * Handle ←/→/Home/End for stage or viewer carousel. Returns true when handled.
 */
export function handleCarouselNavKey(event: KeyboardEvent, handlers: CarouselNavHandlers): boolean {
  if (event.key === "ArrowLeft") {
    event.preventDefault();
    handlers.goPrev();
    return true;
  }
  if (event.key === "ArrowRight") {
    event.preventDefault();
    handlers.goNext();
    return true;
  }
  if (event.key === "Home") {
    event.preventDefault();
    handlers.goFirst();
    return true;
  }
  if (event.key === "End") {
    event.preventDefault();
    handlers.goLast();
    return true;
  }
  return false;
}
