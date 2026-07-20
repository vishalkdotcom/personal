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
          env: {
            VITE_HIRE_SIGNAL: "true",
          },
          browser: {
            enabled: true,
            provider: playwright(),
            headless: true,
            // Desktop Triptych Dock default; mobile App Shell tests call page.viewport.
            viewport: { width: 1280, height: 800 },
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
