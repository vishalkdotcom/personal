import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("Pages Functions routes contract", () => {
  it("limits Functions invocation to /api/*", () => {
    const raw = readFileSync(resolve("static/_routes.json"), "utf8");
    const routes = JSON.parse(raw) as {
      version: number;
      include: string[];
      exclude: string[];
    };

    expect(routes.version).toBe(1);
    expect(routes.include).toEqual(["/api/*"]);
    expect(routes.exclude).toEqual([]);
  });
});

describe("Contact Hire Signal independence", () => {
  it("does not gate Contact Mode modules on VITE_HIRE_SIGNAL", () => {
    const files = [
      "src/contact/content.ts",
      "src/contact/schema.ts",
      "src/contact/delivery.ts",
      "src/stages/contact-stage.tsx",
    ];

    for (const relative of files) {
      const source = readFileSync(resolve(relative), "utf8");
      expect(source, relative).not.toMatch(/VITE_HIRE_SIGNAL|hire-signal|HireSignal/);
    }
  });
});
