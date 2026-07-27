/** Hire Signal: env flag + mobile-only snooze. Desktop rail never snoozes. */

export const HIRE_SIGNAL_SNOOZE_KEY = "hire-signal-snoozed-until";

/** 7 days in ms — absolute expiry written to localStorage. */
export const HIRE_SIGNAL_SNOOZE_MS = 7 * 24 * 60 * 60 * 1000;

/** Expanded mobile chip blurb (shell-round-17 D) — under the Open to roles heading. */
export const HIRE_SIGNAL_CHIP_BLURB = "Senior FE · complex product UI · remote";

const envRaw = import.meta.env.VITE_HIRE_SIGNAL as string | undefined;

/** Test-only override so App Shell seam tests can flip the flag without rebuild. */
let enabledOverride: boolean | undefined;

/** Show Hire Signal UI only for explicit `true` or `1`. */
export function parseHireSignalFlag(raw: string | undefined): boolean {
  return raw === "true" || raw === "1";
}

export function isHireSignalEnabled(): boolean {
  if (enabledOverride !== undefined) return enabledOverride;
  return parseHireSignalFlag(envRaw);
}

/** @internal Vitest App Shell seam — reset in afterEach. */
export function setHireSignalEnabledForTests(enabled: boolean | undefined): void {
  enabledOverride = enabled;
}

export function readHireSignalSnoozedUntil(now = Date.now()): number | null {
  try {
    const raw = localStorage.getItem(HIRE_SIGNAL_SNOOZE_KEY);
    if (raw === null) return null;
    const until = Number(raw);
    if (!Number.isFinite(until) || until <= now) return null;
    return until;
  } catch {
    return null;
  }
}

export function isHireSignalSnoozed(now = Date.now()): boolean {
  return readHireSignalSnoozedUntil(now) !== null;
}

/** Persist absolute expiry `now + 7d` under `hire-signal-snoozed-until`. */
export function snoozeHireSignal(now = Date.now()): void {
  localStorage.setItem(HIRE_SIGNAL_SNOOZE_KEY, String(now + HIRE_SIGNAL_SNOOZE_MS));
}
