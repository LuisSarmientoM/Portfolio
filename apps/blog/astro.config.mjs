import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://blog.lsarmiento.dev",
  output: "static",
  trailingSlash: "always",
  integrations: [sitemap()],

  vite: {
      plugins: [tailwindcss()],
  },
});
