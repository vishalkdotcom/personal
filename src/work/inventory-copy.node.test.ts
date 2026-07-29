import { describe, expect, it } from "vitest";
import { WORK_FOLDERS } from "./inventory";

/** Visitor-copy closers / jargon banned from Work Case ledes, outcomes, and roles. */
const FORBIDDEN_CASE_COPY = [
  /Auth-walled/i,
  /No public demo URL/i,
  /Public deploy you can open/i,
  /Public tool you can open/i,
  /\bPIC\b/,
  /\bOKR\b/,
  /Problem → solution:/i,
  /not a production launch/i,
] as const;

describe("Work Case visitor-copy voice (inventory SoT)", () => {
  for (const folder of WORK_FOLDERS) {
    for (const workCase of folder.cases) {
      it(`${folder.slug}/${workCase.slug} keeps lede, outcomes, and role free of banned closers`, () => {
        const fields = [
          workCase.lede ?? "",
          workCase.role,
          ...workCase.outcomes.flatMap((outcome) => [outcome.label, outcome.text]),
        ];
        for (const field of fields) {
          for (const pattern of FORBIDDEN_CASE_COPY) {
            expect(field, `${workCase.slug} matched ${pattern}`).not.toMatch(pattern);
          }
        }
      });
    }
  }
});

describe("Work Case Outcome lead-labels (inventory SoT)", () => {
  for (const folder of WORK_FOLDERS) {
    for (const workCase of folder.cases) {
      it(`${folder.slug}/${workCase.slug} outcomes are { label, text } with non-empty fields`, () => {
        expect(workCase.outcomes.length).toBeGreaterThan(0);
        for (const outcome of workCase.outcomes) {
          expect(outcome).toEqual(
            expect.objectContaining({
              label: expect.any(String),
              text: expect.any(String),
            }),
          );
          expect(outcome.label.trim().length).toBeGreaterThan(0);
          expect(outcome.text.trim().length).toBeGreaterThan(0);
          expect(outcome).not.toHaveProperty("0");
        }
      });
    }
  }

  it("locks Engage reporting Parity and Depth lead-labels", () => {
    const engage = WORK_FOLDERS.flatMap((folder) => folder.cases).find(
      (entry) => entry.slug === "engage-reporting",
    );
    expect(engage?.outcomes.map((outcome) => outcome.label)).toEqual(["Parity", "Depth"]);
  });

  it("locks SupplyChain+ Craft and AI lead-labels", () => {
    const supplyChain = WORK_FOLDERS.flatMap((folder) => folder.cases).find(
      (entry) => entry.slug === "supplychain-plus",
    );
    expect(supplyChain?.outcomes.map((outcome) => outcome.label)).toEqual(["Craft", "AI"]);
  });
});
