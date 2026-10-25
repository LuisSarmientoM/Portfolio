import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import test from 'node:test';

const resume = JSON.parse(await readFile(new URL('../src/data/resume.json', import.meta.url), 'utf8'));

for (const [lang, path] of [['es', '../dist/index.html'], ['en', '../dist/en/index.html']]) {
  test(`${lang}: generated project metadata includes all projects and omits unavailable URLs`, async () => {
    const html = await readFile(new URL(path, import.meta.url), 'utf8');
    assert.doesNotMatch(html, /bitnode/i, 'Removed project must not appear anywhere in the generated route');
    const jsonLd = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/)?.[1];
    assert.ok(jsonLd, 'Build the portfolio before running rendered tests');
    const schemas = JSON.parse(jsonLd);
    const items = schemas.find(schema => schema['@type'] === 'ItemList').itemListElement;
    const projects = resume.translations[lang].projects;
    assert.equal(items.length, projects.length);
    for (let i = 0; i < projects.length; i++) {
      assert.equal(items[i].position, i + 1);
      assert.equal(items[i].item.name, projects[i].seo.headline);
      assert.equal(items[i].item.url, projects[i].link ?? undefined);
    }
  });

  test(`${lang}: GTM bootstraps with a serialized container ID and no runtime exception`, async () => {
    const html = await readFile(new URL(path, import.meta.url), 'utf8');
    const scripts = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].map(match => match[1]);
    const gtm = scripts.filter(script => script.includes("'gtm.start'"));
    assert.equal(gtm.length, 1);
    const inserted = [];
    const window = {};
    const document = {
      getElementsByTagName: () => [{ parentNode: { insertBefore: node => inserted.push(node) } }],
      createElement: () => ({}),
    };
    runInNewContext(gtm[0], { window, document });
    assert.equal(inserted.length, 1);
    assert.equal(inserted[0].src, 'https://www.googletagmanager.com/gtm.js?id=GTM-WHH6SFHK');
    assert.equal(window.dataLayer[0].event, 'gtm.js');
  });
}
