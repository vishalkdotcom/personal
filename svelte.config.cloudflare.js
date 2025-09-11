import adapter from "@sveltejs/adapter-cloudflare";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://svelte.dev/docs/kit/integrations
  // for more information about preprocessors
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({
      // Cloudflare Pages configuration for static site hosting
      pages: "build",
      assets: "build",
      fallback: undefined,
      precompress: false,
      strict: true
    })
  }
};

export default config;