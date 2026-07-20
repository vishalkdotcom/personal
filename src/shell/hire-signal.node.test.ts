import { afterEach, describe, expect, it, vi } from "vitest";
import {
  HIRE_SIGNAL_SNOOZE_KEY,
  HIRE_SIGNAL_SNOOZE_MS,
  isHireSignalSnoozed,
  parseHireSignalFlag,
  readHireSignalSnoozedUntil,
  snoozeHireSignal,
} from "./hire-signal";

describe("parseHireSignalFlag", () => {
  it("shows only for explicit true or 1", () => {
    expect(parseHireSignalFlag("true")).toBe(true);
    expect(parseHireSignalFlag("1")).toBe(true);
  });

  it("hides for anything else including unset", () => {
    expect(parseHireSignalFlag(undefined)).toBe(false);
    expect(parseHireSignalFlag("")).toBe(false);
    expect(parseHireSignalFlag("false")).toBe(false);
    expect(parseHireSignalFlag("0")).toBe(false);
    expect(parseHireSignalFlag("yes")).toBe(false);
    expect(parseHireSignalFlag("TRUE")).toBe(false);
  });
});

describe("Hire Signal mobile snooze", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function stubStorage(store: Record<string, string> = {}) {
    const storage = {
      getItem: (key: string) => (key in store ? store[key]! : null),
      setItem: (key: string, value: string) => {
        store[key] = value;
      },
      removeItem: (key: string) => {
        delete store[key];
      },
    };
    vi.stubGlobal("localStorage", storage);
    return store;
  }

  it("writes hire-signal-snoozed-until as now + 7 days", () => {
    const store = stubStorage();
    const now = 1_700_000_000_000;
    snoozeHireSignal(now);
    expect(store[HIRE_SIGNAL_SNOOZE_KEY]).toBe(String(now + HIRE_SIGNAL_SNOOZE_MS));
    expect(HIRE_SIGNAL_SNOOZE_MS).toBe(7 * 24 * 60 * 60 * 1000);
  });

  it("reports snoozed while now is before absolute expiry", () => {
    const now = 1_700_000_000_000;
    stubStorage({ [HIRE_SIGNAL_SNOOZE_KEY]: String(now + 60_000) });
    expect(isHireSignalSnoozed(now)).toBe(true);
    expect(readHireSignalSnoozedUntil(now)).toBe(now + 60_000);
  });

  it("clears snooze after expiry", () => {
    const now = 1_700_000_000_000;
    stubStorage({ [HIRE_SIGNAL_SNOOZE_KEY]: String(now - 1) });
    expect(isHireSignalSnoozed(now)).toBe(false);
    expect(readHireSignalSnoozedUntil(now)).toBeNull();
  });
});
