import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const resume = JSON.parse(await readFile(new URL('../src/data/resume.json', import.meta.url), 'utf8'));
const translations = Object.values(resume.translations);
const expectedGroups = {
  commercial: ['Autodistribución', 'Arkos', 'Wespe', 'Godoy Littler', 'Biofix', 'Grupo Gaviria', 'Rooftec', 'Tuatara', 'GreenTech Painting'],
  systems: ['1U Glove', 'Japonesa de Repuestos', 'Estéreo Picnic AR', 'Ranking Transforma', 'Minimal POS', 'Tuatara automation', 'Eventfeed'],
  other: ['Centro de Estudios IJR', 'FLIMM', 'Portfolio'],
};
const expectedLabels = {
  es: ['Sitios corporativos y comerciales', 'Aplicaciones y experiencias digitales', 'Otros proyectos'],
  en: ['Corporate & commercial websites', 'Applications & digital experiences', 'Other projects'],
};
const projectIdentity = name => name.includes('Tuatara') && name !== 'Tuatara' ? 'Tuatara automation' : name;
const publicLinks = {
  'Eventfeed': 'https://eventfeed.me/',
  'Estéreo Picnic AR': 'https://tuatara.co/portafolio/diseno/estereo-pinic/',
  'Autodistribución': 'https://autodistribucion.pe/',
  'Arkos': 'https://arkos.com.co/',
  'Grupo Gaviria': 'https://gaviriafuneraria.com/',
  'Biofix': 'https://biofix.co/',
  'Godoy Littler': 'https://godoylittler.com/',
  'GreenTech Painting': 'https://greentechpainting.com/',
  'Wespe': 'https://wespe.co/',
};

test('both languages include the selected client and software projects', () => {
  for (const data of translations) {
    const names = data.projects.map(project => project.name);
    assert.equal(new Set(names).size, names.length, 'No duplicate projects');
    assert.equal(data.projects.length, 19);
    assert.deepEqual(
      Object.keys(expectedGroups).map(group => data.projects.filter(project => project.group === group).length),
      [9, 7, 3],
    );
    assert.doesNotMatch(JSON.stringify(data), /bitnode/i);
  }
  const identity = data => data.projects.map(({ name, link, group, wip }) => ({
    name: projectIdentity(name),
    link, group, wip: Boolean(wip),
  }));
  assert.deepEqual(identity(resume.translations.es), identity(resume.translations.en));
});

test('projects follow commercial impact order and exact categories without inventing dates', () => {
  for (const [lang, data] of Object.entries(resume.translations)) {
    assert.deepEqual(
      data.projects.map(({ name, group }) => ({ name: projectIdentity(name), group })),
      Object.entries(expectedGroups).flatMap(([group, names]) => names.map(name => ({ name, group }))),
    );
    for (const project of data.projects) {
      assert.ok(Object.hasOwn(expectedGroups, project.group));
      assert.equal(Object.hasOwn(project, 'year'), false);
      assert.ok(project.description.trim());
      assert.ok(project.seo.headline.trim());
      assert.ok(project.seo.description.trim());
      assert.ok(project.tags.length > 0);
    }
    const names = data.projects.map(({ name }) => name);
    for (const corporate of expectedGroups.commercial) {
      for (const personal of ['FLIMM', 'Portfolio']) {
        assert.ok(names.indexOf(corporate) < names.indexOf(personal), `${corporate} must precede ${personal}`);
      }
    }
    assert.equal(data.projects.find(project => project.name === 'Japonesa de Repuestos').wip, true);
    assert.deepEqual(
      ['commercialProjectsTitle', 'systemsProjectsTitle', 'otherProjectsTitle'].map(key => data.labels[key]),
      expectedLabels[lang],
    );
    assert.equal(Object.hasOwn(data.labels, 'featuredProjectsTitle'), false);
    assert.equal(Object.hasOwn(data.labels, 'previousProjectsTitle'), false);
  }
});

test('public URLs are verified and projects without a public link stay nullable', () => {
  for (const data of translations) {
    for (const [name, link] of Object.entries(publicLinks)) {
      assert.equal(data.projects.find(project => project.name === name)?.link, link);
    }
    for (const project of data.projects) {
      if (project.link !== null) {
        assert.equal(new URL(project.link).protocol, 'https:');
        assert.doesNotMatch(project.link, /localhost|webtuatara|127\.0\.0\.1/);
      }
    }
    for (const name of ['Minimal POS', 'Centro de Estudios IJR', '1U Glove']) {
      assert.equal(data.projects.find(project => project.name === name)?.link, null);
    }
  }
});

test('new projects preserve the stated contribution scope in both languages', () => {
  const scope = {
    es: {
      glove: [/desarrollo completo/i, /publicidad en dispensadores de guantes/i, /mapa/i, /ubicación y fechas/i, /anunciantes y gestores/i],
      eventfeed: [/me incorporé en la etapa final/i, /ajusté funcionalidades/i, /soporte para su primer lanzamiento público/i, /eventos/i],
      ar: [/desarrollé el código de la experiencia WebAR/i, /MindAR/, /A-Frame/, /JavaScript/, /reconocimiento de imágenes/i, /visualización 3D/i, /sin instalar una app/i],
      tags: [
        ['Aplicación web', 'Mapas', 'Gestión de campañas'],
        ['Eventos', 'Ajustes funcionales', 'Soporte al lanzamiento'],
      ],
    },
    en: {
      glove: [/complete development/i, /advertising on glove dispensers/i, /map/i, /location and dates/i, /advertisers and managers/i],
      eventfeed: [/I joined during the final stage/i, /refined features/i, /supported its first public launch/i, /events/i],
      ar: [/developed the code for the WebAR experience/i, /MindAR/, /A-Frame/, /JavaScript/, /image recognition/i, /3D visualization/i, /without installing an app/i],
      tags: [
        ['Web application', 'Maps', 'Campaign management'],
        ['Events', 'Feature refinement', 'Launch support'],
      ],
    },
  };
  for (const [lang, data] of Object.entries(resume.translations)) {
    const projects = ['1U Glove', 'Eventfeed', 'Estéreo Picnic AR'].map(name => {
      const project = data.projects.find(project => project.name === name);
      assert.ok(project, `${lang}: missing ${name}`);
      assert.equal(Boolean(project.wip), false);
      assert.equal(project.group, 'systems');
      return project;
    });
    for (const [index, key] of ['glove', 'eventfeed', 'ar'].entries()) {
      for (const phrase of scope[lang][key]) assert.match(projects[index].description, phrase);
    }
    assert.deepEqual(projects[0].tags, scope[lang].tags[0]);
    assert.deepEqual(projects[1].tags, scope[lang].tags[1]);
    assert.deepEqual(projects[2].tags, ['WebAR', 'MindAR', 'A-Frame', 'JavaScript']);
    assert.doesNotMatch(JSON.stringify(projects[0]), /Angular|NestJS|backend/i);
    assert.doesNotMatch(JSON.stringify(projects[1]), /\bAI\b|\bIA\b|inteligencia artificial|artificial intelligence|desarrollo completo|complete development/i);
    assert.doesNotMatch(JSON.stringify(projects[2]), /diseñé|I designed|creé las animaciones|I created the animations|desarrollo completo|complete development/i);
  }
});

test('client projects reflect the owner-confirmed commerce and integration scope', () => {
  for (const [lang, data] of Object.entries(resume.translations)) {
    for (const name of ['Arkos', 'Grupo Gaviria', 'Biofix']) {
      const project = data.projects.find(project => project.name === name);
      assert.match(project.description, /e-commerce/i);
      assert.match(project.seo.headline, /e-commerce/i);
      assert.match(project.seo.description, /e-commerce/i);
      assert.ok(project.tags.includes('E-commerce'));
    }
    const biofix = data.projects.find(project => project.name === 'Biofix');
    assert.match(biofix.description, lang === 'es' ? /nicho/i : /niche/i);
    const godoy = data.projects.find(project => project.name === 'Godoy Littler');
    assert.doesNotMatch(JSON.stringify(godoy), /eleven\s?labs|leven\s?labs|audio/i);
    const glove = data.projects.find(project => project.name === '1U Glove');
    assert.equal(glove.link, null);
    for (const description of [glove.description, glove.seo.description]) {
      assert.match(description, lang === 'es' ? /desarrollo completo/i : /complete development/i);
      assert.match(description, lang === 'es' ? /espacios publicitarios/i : /advertising spaces/i);
    }
  }
});

test('profile icons use consistent keys rather than raw HTML', () => {
  for (const data of translations) {
    assert.deepEqual(data.profile.links.map(({ icon }) => icon), ['email', 'github', 'linkedin']);
    assert.equal(data.profile.location, 'Medellín, Colombia');
  }
});
