/**
 * Tests du moteur — lancer avec : node tests/test.js  (ou npm test)
 * Aucune dépendance : uniquement le module `assert` de Node.
 */
'use strict';

const assert = require('assert');
const path = require('path');

const E = require(path.join(__dirname, '../engine.js'));
const THEMES = require(path.join(__dirname, '../themes.js'));
const { TEMPLATES: CV_TEMPLATES, generateCV } = require(path.join(__dirname, '../cv.js'));

let passed = 0;
let failed = 0;
function test(name, fn) {
  try {
    fn();
    passed++;
    console.log('  ✔ ' + name);
  } catch (err) {
    failed++;
    console.log('  ✘ ' + name + '\n      ' + err.message);
  }
}

const PIXEL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
const EVIL = '<script>alert(1)</script>';

const sample = () => ({
  profile: {
    name: 'Awa "Koffi" ' + EVIL,
    title: 'Développeuse <b>web</b>',
    tagline: 'Accroche ' + EVIL,
    bio: 'Première ligne.\n- Puce un\n- Puce deux\n\nDeuxième paragraphe.',
    email: 'awa@exemple.com',
    phone: '+229 01 23 45 67 89',
    location: 'Cotonou, Bénin',
    availability: 'Immédiate',
    experience: '4',
    website: 'awa.dev',
    github: 'https://github.com/awa',
    linkedin: 'javascript:alert(1)',
    twitter: 'data:text/html,<script>alert(1)</script>',
    avatar: PIXEL
  },
  skills: [{ name: 'React', group: 'Web' }, { name: 'Figma', group: 'Design' }, { name: 'Node.js', level: 80 }],
  softSkills: [{ name: 'Autonomie' }],
  languagesList: [{ name: 'Français', level: 'Natif' }],
  hobbiesList: [{ name: 'Photo' }],
  references: [{ name: 'Jean', role: 'CTO', contact: 'jean@x.com' }],
  projects: [
    { title: 'Projet ' + EVIL, description: 'Desc\n- a\n- b', technologies: 'React, Node.js', result: '+60 %', liveUrl: 'https://exemple.com', githubUrl: 'javascript:alert(1)', image: PIXEL, date: '2025', role: 'Solo' },
    { title: 'Sans image', description: 'x', liveUrl: 'exemple.org/demo' }
  ],
  experience: [{ role: 'Dev', organization: 'Corp', startDate: '2023', endDate: '', description: '- mission', achievements: '-30 % de bugs' }],
  education: [{ degree: 'Licence', institution: 'UAC', startDate: '2019', endDate: '2022' }],
  certificationsList: [{ name: 'Cert ' + EVIL, authority: 'OIF', date: '2025' }],
  design: { accentColor: '#e8743b', secondaryColor: '#f2b84b', cvAccent: '#2563eb' }
});

/** Contrôles de structure communs à toutes les pages générées. */
function checkHtml(html, label) {
  assert.ok(!html.includes(EVIL), label + ' : balise <script> injectée non échappée');
  assert.ok(!/<a\s[^>]*href="\s*(javascript|data):/i.test(html), label + ' : lien javascript:/data: présent');
  assert.ok(!/<\/style>\s*<script>alert/i.test(html), label + ' : sortie de la balise <style>');
  assert.ok(!/<p[^>]*>(?:(?!<\/p>)[\s\S])*?<(div|ul|ol|section|h[1-6])[\s>]/i.test(html), label + ' : bloc dans un <p> (HTML invalide)');
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]);
  const dup = ids.filter((id, i) => ids.indexOf(id) !== i);
  assert.deepStrictEqual(dup, [], label + ' : identifiants en double ' + dup.join(', '));
  [...html.matchAll(/href="#([^"]+)"/g)].forEach(m => assert.ok(ids.includes(m[1]), label + ' : ancre #' + m[1] + ' introuvable'));
  assert.strictEqual((html.match(/<h1[\s>]/g) || []).length, 1, label + ' : il faut exactement un <h1>');
}

console.log('\nOutils');

test('esc échappe les caractères HTML', () => {
  assert.strictEqual(E.esc('<a href="x">\'&'), '&lt;a href=&quot;x&quot;&gt;&#39;&amp;');
  assert.strictEqual(E.esc(null), '');
});

test('safeUrl accepte http(s) et complète les domaines nus', () => {
  assert.strictEqual(E.safeUrl('https://exemple.com/a?b=1'), 'https://exemple.com/a?b=1');
  assert.strictEqual(E.safeUrl('github.com/moi'), 'https://github.com/moi');
  assert.strictEqual(E.safeUrl('www.exemple.bj'), 'https://www.exemple.bj/');
});

test('safeUrl refuse javascript:, data:, mailto: et le texte libre', () => {
  ['javascript:alert(1)', ' JavaScript:alert(1)', 'data:text/html,x', 'vbscript:x', 'pas une url', 'mailto:a@b.c'].forEach(u =>
    assert.strictEqual(E.safeUrl(u), '', u));
});

test('richText crée paragraphes et listes, en échappant le contenu', () => {
  const out = E.richText('Intro <b>\n- un\n- deux\n\nFin');
  assert.strictEqual(out, '<p>Intro &lt;b&gt;</p><ul><li>un</li><li>deux</li></ul><p>Fin</p>');
});

test('normalize reprend les anciens formats de données', () => {
  const d = E.normalize({
    profile: { name: 'X', languages: 'Français, Anglais', hobbies: 'Photo; Foot' },
    timeline: [{ role: 'Dev' }],
    certifications: [{ name: 'AWS' }],
    skills: [{ name: 'JS', level: 90 }]
  });
  assert.strictEqual(d.experience.length, 1);
  assert.strictEqual(d.certifications.length, 1);
  assert.deepStrictEqual(d.languages.map(l => l.name), ['Français', 'Anglais']);
  assert.deepStrictEqual(d.hobbies, ['Photo', 'Foot']);
  assert.deepStrictEqual(d.skills, [{ name: 'JS', group: '' }]);
});

test('ensureContrast garantit un contraste lisible', () => {
  const c = E.ensureContrast('#111827', '#0e0d0b', 4.5);
  assert.ok(E.contrast(c, '#0e0d0b') >= 4.5);
  const l = E.ensureContrast('#facc15', '#ffffff', 4.5);
  assert.ok(E.contrast(l, '#ffffff') >= 4.5);
});

console.log('\nPortfolios');

Object.keys(THEMES).forEach(id => {
  test('thème « ' + THEMES[id].name + ' » : HTML valide et sûr', () => {
    const out = E.generatePortfolio(sample(), id);
    checkHtml(out.html, id);
    assert.ok(out.html.includes('<meta name="description"'), 'meta description manquante');
    assert.ok(out.html.includes('https://wa.me/22901234567'), 'lien WhatsApp manquant');
    assert.ok(out.html.includes('href="https://awa.dev/"'), 'site perso non normalisé');
    assert.ok(!out.html.includes('linkedin'), 'le lien LinkedIn invalide aurait dû être ignoré');
    assert.ok(out.css.includes('html[data-mode="light"]') && out.css.includes('html[data-mode="dark"]'), 'palettes clair/sombre manquantes');
  });
});

test('le mode export sépare CSS, JS et images', () => {
  const out = E.generatePortfolio(sample(), 'signature', { export: true });
  assert.ok(out.html.includes('<link rel="stylesheet" href="styles.css">'));
  assert.ok(out.html.includes('<script src="script.js" defer></script>'));
  assert.ok(out.js.length > 500, 'script.js vide');
  assert.deepStrictEqual(out.images.map(i => i.path), ['images/avatar.png', 'images/project-1.png']);
  assert.ok(out.html.includes('src="images/avatar.png"') && out.html.includes('src="images/project-1.png"'));
  assert.ok(!out.html.includes('data:image/png'), 'les images doivent être des fichiers, pas du base64');
});

test('les sections vides disparaissent avec leur lien de menu', () => {
  const out = E.generatePortfolio({ profile: { name: 'Solo' } }, 'minimal');
  checkHtml(out.html, 'vide');
  ['id="projets"', 'id="parcours"', 'id="competences"', 'id="formation"'].forEach(s => assert.ok(!out.html.includes(s), s));
  assert.ok(out.html.includes('id="contact"'));
  assert.ok(out.html.includes('portrait-monogram'), 'sans photo, les initiales doivent s’afficher');
});

test('chaque thème garde un accent lisible, même avec une couleur difficile', () => {
  ['#111827', '#facc15', '#ffffff', '#e8743b'].forEach(color => {
    Object.values(THEMES).forEach(t => {
      const css = E.generatePortfolio({ profile: { name: 'A' }, design: { accentColor: color } }, t.id).css;
      ['light', 'dark'].forEach(mode => {
        const block = css.split('html[data-mode="' + mode + '"]')[1];
        const text = block.match(/--accent-text: (#[0-9a-f]{6})/)[1];
        assert.ok(E.contrast(text, t[mode].bg) >= 4.5, t.id + '/' + mode + ' ' + color + ' → ' + text);
      });
    });
  });
});

console.log('\nCV');

Object.keys(CV_TEMPLATES).forEach(id => {
  test('CV « ' + CV_TEMPLATES[id].name + ' » : contenu complet et sûr', () => {
    const data = sample();
    data.design.cvTemplate = id;
    const html = generateCV(data);
    assert.ok(!html.includes(EVIL), 'script injecté');
    assert.ok(!/overflow:\s*hidden/.test(html), 'le CV ne doit rien couper');
    ['Dev', 'Licence', 'React', 'Autonomie', 'Français', 'Jean'].forEach(t => assert.ok(html.includes(t), t + ' manquant'));
  });
});

test('les anciens modèles de CV sont redirigés vers un modèle existant', () => {
  ['twotone', 'split', 'academic', 'executive', 'startup', 'terminal', 'artistic', 'inconnu'].forEach(old => {
    const data = sample();
    data.design.cvTemplate = old;
    assert.ok(/class="cv-page cv-(modern|classic|minimalist|elegant)"/.test(generateCV(data)), old);
  });
});

console.log('\n' + passed + ' tests réussis' + (failed ? ', ' + failed + ' en échec' : '') + '\n');
process.exit(failed ? 1 : 0);
