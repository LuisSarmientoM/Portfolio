# Portfolio

Portfolio personal de Luis Sarmiento construido con Astro 5 y Tailwind CSS 4.

## Requisitos

- Node.js 20+
- npm 10+

## Instalacion

```bash
npm install
```

## Scripts

- `npm run dev`: inicia el servidor de desarrollo.
- `npm run check`: ejecuta chequeos de Astro/TypeScript.
- `npm run build`: genera el sitio estatico en `dist/`.
- `npm run preview`: levanta una vista previa de produccion.

## Estructura principal

- `src/pages`: rutas del sitio (home, idiomas y blog).
- `src/components`: componentes reutilizables de UI.
- `src/layouts`: layouts base y de posts.
- `src/data/resume.json`: contenido principal del portfolio.
- `src/styles/global.css`: estilos globales y Tailwind.

## Deploy

El proyecto esta configurado para GitHub Pages con:

- `site`: `https://luissarmientom.github.io`
- `base`: `/Portfolio`

Los workflows en `.github/workflows/` construyen y publican `dist/` en la rama `gh-pages`.
