import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vitest/config";
import solid from "vite-plugin-solid";

export default defineConfig({
  plugins: [solid(), tailwindcss()],
  publicDir: "static",
  resolve: {
    dedupe: ["solid-js", "@solidjs/web", "@solidjs/router", "@solidjs/meta", "@solidjs/signals"],
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test-setup.ts"],
    globals: true,
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
  },
});
