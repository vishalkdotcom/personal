import { resolve } from "node:path";
import tailwindcss from "@tailwindcss/vite";
import { playwright } from "@vitest/browser-playwright";
import type { Plugin } from "vite";
import { defineConfig } from "vitest/config";
import solid from "vite-plugin-solid";
import { emitMetaShells } from "./src/meta/emit-meta-shells";

const solidDedupe = [
  "solid-js",
  "@solidjs/web",
  "@solidjs/router",
  "@solidjs/meta",
  "@solidjs/signals",
] as const;

/** Stamp per-path HTML meta shells after Vite emits the SPA index HTML. */
function stampMetaShellsPlugin(): Plugin {
  let outDir = "dist";
  return {
    name: "stamp-meta-shells",
    apply: "build",
    configResolved(config) {
      outDir = config.build.outDir;
    },
    closeBundle() {
      emitMetaShells(resolve(outDir));
    },
  };
}

export default defineConfig({
  plugins: [solid(), tailwindcss(), stampMetaShellsPlugin()],
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
            // Avoid Windows Hyper-V excluded ephemeral ranges (::1 bind EACCES).
            api: { host: "127.0.0.1", port: 32123 },
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
