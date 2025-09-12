import devtoolsJson from "vite-plugin-devtools-json";
import tailwindcss from "@tailwindcss/vite";
import { sveltekit } from "@sveltejs/kit/vite";
import { enhancedImages } from "@sveltejs/enhanced-img";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [enhancedImages(), tailwindcss(), sveltekit(), devtoolsJson()],
  build: {
    rollupOptions: {
      external: ["@react-email/render"],
    },
  },
});
