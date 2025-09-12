import devtoolsJson from "vite-plugin-devtools-json";
import tailwindcss from "@tailwindcss/vite";
import { sveltekit } from "@sveltejs/kit/vite";
import { enhancedImages } from "@sveltejs/enhanced-img";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [enhancedImages(), tailwindcss(), sveltekit(), devtoolsJson()],
  resolve: {
    alias: {
      // Provide a stub for @react-email/render to prevent Cloudflare bundling issues
      "@react-email/render": "./src/lib/react-email-stub.js",
    },
  },
});
