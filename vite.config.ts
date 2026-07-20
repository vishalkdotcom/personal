import tailwindcss from "@tailwindcss/vite";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";
import solid from "vite-plugin-solid";

const solidDedupe = [
  "solid-js",
  "@solidjs/web",
  "@solidjs/router",
  "@solidjs/meta",
  "@solidjs/signals",
] as const;

export default defineConfig({
  plugins: [solid(), tailwindcss()],
  publicDir: "static",
  resolve: {
    dedupe: [...solidDedupe],
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
  test: {
    globals: true,
    // Legacy App Shell / theme / FOUC suites stay on disk until later migration
    // tickets rename them to *.browser.test.* / *.node.test.ts.
    passWithNoTests: true,
    projects: [
      {
        // Vitest projects do not inherit root Vite config — restate Solid wiring.
        plugins: [solid()],
        resolve: {
          dedupe: [...solidDedupe],
        },
        test: {
          name: "browser",
          include: ["src/**/*.browser.test.{ts,tsx}"],
          browser: {
            enabled: true,
            provider: playwright(),
            headless: true,
            instances: [{ browser: "chromium" }],
          },
        },
      },
      {
        test: {
          name: "node",
          include: ["src/**/*.node.test.ts"],
          environment: "node",
        },
      },
    ],
  },
});
