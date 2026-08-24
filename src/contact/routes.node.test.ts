import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("Pages Functions routes contract", () => {
  it("runs Functions on document routes so Accept negotiation and 404s work", () => {
    const raw = readFileSync(resolve("static/_routes.json"), "utf8");
    const routes = JSON.parse(raw) as {
      version: number;
      include: string[];
      exclude: string[];
    };

    expect(routes.version).toBe(1);
    expect(routes.include).toEqual(["/*"]);
    expect(routes.exclude).toEqual(["/assets/*", "/fonts/*"]);
  });

  it("sets markdown Content-Type on .md assets via Pages _headers", () => {
    const headers = readFileSync(resolve("static/_headers"), "utf8");
    expect(headers).toMatch(/\/\*\.md/);
    expect(headers).toMatch(/Content-Type:\s*text\/markdown; charset=utf-8/);
    expect(headers).toMatch(/Vary:\s*Accept/);
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
