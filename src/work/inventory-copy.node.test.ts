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

/** Spec-locked `/work` framing + Context Rail Role (beta-feedback-round-2). */
const LOCKED_FRAMING: Record<string, string> = {
  "labor-solutions": "Senior Frontend · reporting & surveys",
  "advance-auto-parts": "Frontend Engineer · store KPI & ML ops",
  prototypes: "Solo · live demos",
  tools: "Solo · local-first utilities",
};

describe("Work Folder framing and Context Rail Role (inventory SoT)", () => {
  it("locks the four Work index framings without leading org/folder names", () => {
    for (const folder of WORK_FOLDERS) {
      expect(folder.framing, folder.slug).toBe(LOCKED_FRAMING[folder.slug]);
      expect(folder.framing, folder.slug).not.toMatch(new RegExp(`^${folder.title}\\s·`));
    }
  });

  it("locks employer Context Rail Role to role + org only", () => {
    for (const workCase of WORK_FOLDERS.find((f) => f.slug === "labor-solutions")!.cases) {
      expect(workCase.role).toBe("Senior Frontend · Labor Solutions");
      expect(workCase.role).not.toContain(workCase.title);
    }
    for (const workCase of WORK_FOLDERS.find((f) => f.slug === "advance-auto-parts")!.cases) {
      expect(workCase.role).toBe("Frontend Engineer · Advance Auto Parts");
      expect(workCase.role).not.toContain(workCase.title);
      expect(workCase.role).not.toMatch(/Senior/);
    }
  });

  it("locks every public-storefront Context Rail Role to solo build", () => {
    for (const folder of WORK_FOLDERS) {
      for (const workCase of folder.cases) {
        if (workCase.surface !== "public-storefront") continue;
        expect(workCase.role, workCase.slug).toBe("solo build");
        expect(workCase.role, workCase.slug).not.toContain(workCase.title);
      }
    }
  });
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

  it("locks Engage reporting Tier A metrics and access-description artifact", () => {
    const engage = WORK_FOLDERS.flatMap((folder) => folder.cases).find(
      (entry) => entry.slug === "engage-reporting",
    );
    expect(engage?.surface).toBe("internal-dossier");
    if (engage?.surface !== "internal-dossier") return;
    expect(engage.metrics).toEqual([
      { value: "PIC", label: "on 6 OKRs" },
      { value: "0.5→1.0", label: "OKR across 43 tracked tickets" },
      { value: "~2×", label: "build ~84.5s→~40.6s" },
    ]);
    expect(engage.metricsFootnote).toMatch(/platform-adjacent/i);
    expect(engage.artifacts?.map((artifact) => artifact.title)).toEqual([
      "Problem → fix",
      "What you'd see if you had access",
    ]);
  });

  it("keeps non-Engage Internal Dossiers free of metrics and redundant What shipped cards", () => {
    for (const folder of WORK_FOLDERS) {
      for (const workCase of folder.cases) {
        if (workCase.surface !== "internal-dossier" || workCase.slug === "engage-reporting") {
          continue;
        }
        expect(workCase.metrics, workCase.slug).toBeUndefined();
        expect(workCase.metricsFootnote, workCase.slug).toBeUndefined();
        expect(workCase.artifacts ?? [], workCase.slug).toEqual([]);
      }
    }
  });

  it("locks SupplyChain+ Craft and AI lead-labels", () => {
    const supplyChain = WORK_FOLDERS.flatMap((folder) => folder.cases).find(
      (entry) => entry.slug === "supplychain-plus",
    );
    expect(supplyChain?.outcomes.map((outcome) => outcome.label)).toEqual(["Craft", "AI"]);
  });
});
