import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
  site: "https://lsarmiento.dev",
  output: "static",
  trailingSlash: "always",

  vite: {
      plugins: [tailwindcss()],
  },

  adapter: cloudflare(),
});