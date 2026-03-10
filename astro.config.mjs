import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
    srcDir: "src",
    vite: {
        plugins: [tailwindcss()],
    },
    site: "https://lsarmiento.dev",
});
