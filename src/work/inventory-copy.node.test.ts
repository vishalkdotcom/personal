import { describe, expect, it } from "vitest";
import { WORK_FOLDERS, workInventoryStackUnion } from "./inventory";

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

/** Frequency-desc then alpha — worked from inventory `stack[]` counts (beta-feedback-round-2). */
const LOCKED_WORK_INDEX_STACK = [
  "TypeScript",
  "Next.js",
  "React",
  "React 19",
  "Snowflake",
  "Vercel AI SDK",
  "Canvas",
  "Client-side layout",
  "Client-side PDF",
  "Django",
  "Drizzle ORM",
  "Excel import/export",
  "Gemini",
  "html2canvas",
  "IndexedDB",
  "jsPDF",
  "Metabase Embedding SDK",
  "Next.js 15",
  "Next.js 16",
  "Nivo",
  "PDF",
  "PostgreSQL/pgvector",
  "Python",
  "Redux Toolkit",
  "shadcn/ui",
  "Streamlit",
  "Tailwind CSS",
  "Tremor",
  "Zod",
] as const;

describe("Work index Context Rail Stack union (inventory SoT)", () => {
  it("returns the deduped frequency-sorted union of case stacks", () => {
    expect(workInventoryStackUnion()).toEqual([...LOCKED_WORK_INDEX_STACK]);
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

/** Manifest-locked Public Storefront carousel (2026-07-30 screenshot capture manifest). */
const LOCKED_PUBLIC_STOREFRONT_MEDIA: Record<
  string,
  ReadonlyArray<{ label: string; src: string }>
> = {
  "supplychain-plus": [
    { label: "Control Center risk overview", src: "work/supplychain-plus/home.png" },
    { label: "Why this supplier is high risk", src: "work/supplychain-plus/diagnosis.png" },
    { label: "Remediation with evidence timeline", src: "work/supplychain-plus/audit.png" },
    { label: "Ask questions, get cited answers", src: "work/supplychain-plus/ai-assistant.png" },
    { label: "Compliance across frameworks", src: "work/supplychain-plus/regulatory-radar.png" },
  ],
  promptsurvey: [
    { label: "Prompt to multi-type questions", src: "work/promptsurvey/builder.png" },
    { label: "Respondent preview of the survey", src: "work/promptsurvey/survey.png" },
    { label: "Language controls for translation", src: "work/promptsurvey/translate.png" },
    { label: "Regenerate one question with AI", src: "work/promptsurvey/regenerate.png" },
  ],
  snap2paper: [
    { label: "Drop photos to extract questions", src: "work/snap2paper/scan.png" },
    { label: "Edit MCQs in your library", src: "work/snap2paper/library.png" },
    { label: "Print preview with source photos", src: "work/snap2paper/print.png" },
  ],
  photogrid: [
    { label: "Passport grid on 4×6 with guides", src: "work/photogrid/layout.png" },
    { label: "Wallet photos on A4 sheet", src: "work/photogrid/wallet-a4.png" },
    { label: "Crop, zoom, and rotate each photo", src: "work/photogrid/photo-editor.png" },
  ],
  pdfgrid: [
    { label: "Live N-up preview before export", src: "work/pdfgrid/preview.png" },
    { label: "Generate print-ready grid PDF", src: "work/pdfgrid/export.png" },
    { label: "Standard and saved layout presets", src: "work/pdfgrid/presets.png" },
  ],
};

describe("Public Storefront curated carousel (inventory SoT)", () => {
  it("locks manifest slide counts, order, sentence-case captions, and final filenames", () => {
    for (const [slug, locked] of Object.entries(LOCKED_PUBLIC_STOREFRONT_MEDIA)) {
      const workCase = WORK_FOLDERS.flatMap((folder) => folder.cases).find(
        (entry) => entry.slug === slug,
      );
      expect(workCase, slug).toBeDefined();
      expect(workCase!.surface).toBe("public-storefront");
      expect(workCase!.media, slug).toEqual([...locked]);
      for (const slide of workCase!.media!) {
        expect(slide.label, slide.src).not.toMatch(/^Shot\s+\d+\s*·/i);
        expect(slide.label, slide.src).toBe(slide.label.trim());
        expect(slide.label, slide.src).not.toBe(slide.label.toUpperCase());
      }
    }
  });

  it("does not ship dropped or probe/debug storefront filenames", () => {
    const shipped = new Set(
      WORK_FOLDERS.flatMap((folder) => folder.cases)
        .filter((entry) => entry.surface === "public-storefront")
        .flatMap((entry) => entry.media ?? [])
        .map((slide) => slide.src),
    );
    for (const dropped of [
      "work/supplychain-plus/intelligence-briefing.png",
      "work/supplychain-plus/operations-jobs.png",
      "work/supplychain-plus/suppliers-index.png",
      "work/promptsurvey/prompt-empty.png",
      "work/promptsurvey/library-saved.png",
      "work/promptsurvey/ai-config.png",
      "work/promptsurvey/_probe-puppeteer.png",
      "work/snap2paper/edit-with-source.png",
      "work/snap2paper/empty-home.png",
      "work/snap2paper/settings.png",
      "work/snap2paper/_debug-show-source.png",
      "work/photogrid/sizes.png",
      "work/photogrid/print.png",
      "work/photogrid/empty-controls.png",
      "work/pdfgrid/grid.png",
      "work/pdfgrid/preview-overlays.png",
      "work/pdfgrid/compile-progress.png",
    ]) {
      expect(shipped.has(dropped), dropped).toBe(false);
    }
    expect([...shipped].some((src) => src.includes("qgenai"))).toBe(false);
  });
});
