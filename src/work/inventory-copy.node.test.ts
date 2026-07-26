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
        const fields = [workCase.lede ?? "", workCase.role, ...workCase.outcomes];
        for (const field of fields) {
          for (const pattern of FORBIDDEN_CASE_COPY) {
            expect(field, `${workCase.slug} matched ${pattern}`).not.toMatch(pattern);
          }
        }
      });
    }
  }
});
