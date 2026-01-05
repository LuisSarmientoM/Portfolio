import { defineConfig } from 'astro/config';

export default defineConfig({
  srcDir: 'src',
  server: {
    host: true,
  },
  site: 'https://luissarmientom.github.io',
  base: '/Portfolio',
});
