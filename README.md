# Personal Sites Monorepo

Monorepo con dos sitios Astro:

- `apps/portfolio`: sitio principal de portafolio.
- `apps/blog`: sitio de blog separado.

## Requisitos

- Node.js 20+
- pnpm 9+

## Instalacion

```bash
pnpm install
```

## Scripts (raiz)

- `pnpm dev:portfolio`: desarrollo del portafolio.
- `pnpm dev:blog`: desarrollo del blog.
- `pnpm build`: build de ambos sitios.
- `pnpm check`: chequeos de Astro/TypeScript en ambos sitios.
- `pnpm preview:portfolio`: preview de portfolio.
- `pnpm preview:blog`: preview de blog.

## Variables de entorno

### Portfolio (`apps/portfolio`)

- `PUBLIC_CONTACT_API_URL`: endpoint publico del formulario de contacto.
- `PUBLIC_BLOG_URL`: URL publica del blog (por defecto `https://blog.lsarmiento.dev`).

### Blog (`apps/blog`)

- `PUBLIC_PORTFOLIO_URL`: URL publica del portafolio (por defecto `https://lsarmiento.dev`).

## Notas

- El Worker del formulario de contacto vive en `apps/portfolio/workers/contact/`.
- Cada app tiene su propio `astro.config.mjs` y `tsconfig.json`.

## Deploy en Cloudflare (separado por app)

Los deploys estan divididos en workflows independientes:

- `.github/workflows/deploy-portfolio.yml`
- `.github/workflows/deploy-blog.yml`
- `.github/workflows/deploy-contact-worker.yml`

Cada workflow usa filtros por `paths`, asi que:

- si haces push solo a `apps/portfolio/**`, se despliega solo portfolio;
- si haces push solo a `apps/blog/**`, se despliega solo blog;
- si haces push solo a `apps/portfolio/workers/contact/**`, se despliega solo el worker.

### Secrets de GitHub requeridos

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_PAGES_PROJECT_PORTFOLIO`
- `CLOUDFLARE_PAGES_PROJECT_BLOG`
- `RESEND_API_KEY` (solo para el workflow del worker)

### Variables de GitHub recomendadas

- `PUBLIC_BLOG_URL`
- `PUBLIC_CONTACT_API_URL`
- `PUBLIC_PORTFOLIO_URL`
