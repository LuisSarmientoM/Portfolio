import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  srcDir: 'src',
  vite: {
    plugins: [tailwindcss()],
  },
  server: {
    host: true,
  },
  site: 'https://luissarmientom.github.io',
  base: '/Portfolio',
});
