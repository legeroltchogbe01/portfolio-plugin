/**
 * Portfolio Studio — génération de CV (A4)
 *
 * 4 modèles partagent les mêmes blocs de contenu ; seuls la mise en page
 * (colonne latérale ou non) et le style changent. Le CV peut s'étendre sur
 * plusieurs pages : rien n'est coupé, les blocs évitent d'être scindés.
 *
 * Dépend de engine.js (PortfolioEngine).
 */
(function (root) {
  'use strict';

  const E = root.PortfolioEngine || (typeof require === 'function' ? require('./engine.js') : null);
  const { esc, richText, prettyUrl, initials, ensureContrast, inkOn } = E;

  const TEMPLATES = {
    modern: {
      id: 'modern', name: 'Moderne', description: 'Colonne latérale colorée, 2 colonnes.',
      swatch: ['#1e293b', '#3b82f6'], accent: '#2563eb', sidebar: true
    },
    classic: {
      id: 'classic', name: 'Classique', description: '1 colonne sobre, idéale pour les logiciels de recrutement (ATS).',
      swatch: ['#ffffff', '#0f172a'], accent: '#1e3a8a', sidebar: false
    },
    minimalist: {
      id: 'minimalist', name: 'Minimaliste', description: 'Épuré et aéré, compétences dans une colonne fine.',
      swatch: ['#ffffff', '#111827'], accent: '#111827', sidebar: 'right'
    },
    elegant: {
      id: 'elegant', name: 'Élégant', description: 'Serif, en-tête centré, ton éditorial.',
      swatch: ['#faf7f2', '#9a3412'], accent: '#9a3412', sidebar: false
    }
  };

  // Anciens identifiants (versions précédentes) -> modèle le plus proche
  const LEGACY = { split: 'modern', twotone: 'modern', terminal: 'minimalist', startup: 'minimalist', artistic: 'elegant', academic: 'classic', executive: 'elegant' };

  function block(title, content, cls) {
    if (!content) return '';
    return '<section class="cv-section ' + (cls || '') + '"><h2>' + esc(title) + '</h2>' + content + '</section>';
  }

  function dates(a, b) {
    if (a && b) return esc(a) + ' – ' + esc(b);
    if (a) return esc(a) + ' – aujourd’hui';
    return esc(b);
  }

  function contactItems(p) {
    const items = [];
    if (p.email) items.push(['Email', esc(p.email)]);
    if (p.phone) items.push(['Téléphone', esc(p.phone)]);
    if (p.location) items.push(['Lieu', esc(p.location) + (p.relocation ? ' · ' + esc(p.relocation) : '')]);
    if (p.website) items.push(['Site', esc(prettyUrl(p.website))]);
    if (p.linkedin) items.push(['LinkedIn', esc(prettyUrl(p.linkedin))]);
    if (p.github) items.push(['GitHub', esc(prettyUrl(p.github))]);
    return items;
  }

  function sections(d) {
    const p = d.profile;
    const exp = d.experience.map(t =>
      '<div class="cv-item"><div class="cv-item-head"><h3>' + esc(t.role) + '</h3><span class="cv-date">' + dates(t.startDate, t.endDate) + '</span></div>' +
      (t.organization ? '<p class="cv-org">' + esc(t.organization) + '</p>' : '') +
      (t.description ? '<div class="cv-rich">' + richText(t.description) + '</div>' : '') +
      (t.achievements ? '<p class="cv-result">→ ' + esc(t.achievements) + '</p>' : '') +
      '</div>').join('');

    const projects = d.projects.slice(0, 4).map(pr =>
      '<div class="cv-item"><div class="cv-item-head"><h3>' + esc(pr.title) + '</h3><span class="cv-date">' + esc(pr.date) + '</span></div>' +
      ((pr.category || pr.role) ? '<p class="cv-org">' + [pr.category, pr.role].filter(Boolean).map(esc).join(' · ') + '</p>' : '') +
      (pr.description ? '<div class="cv-rich">' + richText(pr.description) + '</div>' : '') +
      (pr.result ? '<p class="cv-result">→ ' + esc(pr.result) + '</p>' : '') +
      (pr.technologies.length ? '<p class="cv-tech">' + pr.technologies.map(esc).join(' · ') + '</p>' : '') +
      (pr.liveUrl ? '<p class="cv-link">' + esc(prettyUrl(pr.liveUrl)) + '</p>' : '') +
      '</div>').join('');

    const edu = d.education.map(e =>
      '<div class="cv-item"><div class="cv-item-head"><h3>' + esc(e.degree) + '</h3><span class="cv-date">' + dates(e.startDate, e.endDate) + '</span></div>' +
      (e.institution ? '<p class="cv-org">' + esc(e.institution) + '</p>' : '') + '</div>').join('');

    const certs = d.certifications.map(c =>
      '<div class="cv-item cv-item-sm"><h3>' + esc(c.name) + '</h3><p class="cv-org">' + [c.authority, c.date].filter(Boolean).map(esc).join(' · ') + '</p></div>').join('');

    const groups = new Map();
    d.skills.forEach(s => {
      const g = s.group || 'Compétences';
      if (!groups.has(g)) groups.set(g, []);
      groups.get(g).push(esc(s.name));
    });
    let skills = '';
    groups.forEach((list, g) => {
      skills += '<div class="cv-skill-group">' + (groups.size > 1 || g !== 'Compétences' ? '<h3>' + esc(g) + '</h3>' : '') +
        '<ul class="cv-tags">' + list.map(n => '<li>' + n + '</li>').join('') + '</ul></div>';
    });

    const soft = d.softSkills.length ? '<ul class="cv-tags">' + d.softSkills.map(s => '<li>' + esc(s) + '</li>').join('') + '</ul>' : '';
    const langs = d.languages.map(l => '<p class="cv-line"><strong>' + esc(l.name) + '</strong>' + (l.level ? ' — ' + esc(l.level) : '') + '</p>').join('');
    const hobbies = d.hobbies.length ? '<p class="cv-line">' + d.hobbies.map(esc).join(' · ') + '</p>' : '';
    const refs = d.references.map(r => '<div class="cv-item cv-item-sm"><h3>' + esc(r.name) + '</h3>' +
      (r.role ? '<p class="cv-org">' + esc(r.role) + '</p>' : '') + (r.contact ? '<p class="cv-line">' + esc(r.contact) + '</p>' : '') + '</div>').join('');

    return {
      profile: p.bio ? '<div class="cv-rich">' + richText(p.bio) + '</div>' : '',
      experience: exp, projects, education: edu, certifications: certs,
      skills, soft, langs, hobbies, refs
    };
  }

  // Règles globales, utilisées seulement quand le CV est une page à part entière.
  const STANDALONE = `
* { box-sizing: border-box; margin: 0; padding: 0; }
body { background: #e9ecef; }
@media print {
  body { background: none; }
  .cv-page { margin: 0 !important; width: auto !important; min-height: 0 !important; }
  @page { size: A4; margin: 0; }
}
`;

  // Toutes les règles ci-dessous sont limitées au bloc .cv-page (voir scope()),
  // ce qui permet aussi d'insérer le CV dans une autre page sans la perturber.
  const BASE = `
.cv-page, .cv-page * { box-sizing: border-box; margin: 0; padding: 0; }
.cv-page { width: 210mm; min-height: 297mm; margin: 0 auto; background: #fff;
  color: var(--ink); font-family: var(--font); font-size: 10pt; line-height: 1.5; text-align: left;
  -webkit-print-color-adjust: exact; print-color-adjust: exact; }
h1 { font-size: 24pt; line-height: 1.1; letter-spacing: -0.01em; }
.cv-title { font-size: 12pt; color: var(--accent-text); font-weight: 600; margin-top: 3px; }
.cv-tagline { font-size: 10pt; color: var(--muted); margin-top: 2px; }
.cv-section { margin-top: 14px; }
.cv-section > h2 { font-size: 10.5pt; text-transform: uppercase; letter-spacing: .08em; color: var(--accent-text);
  padding-bottom: 4px; margin-bottom: 8px; border-bottom: 1px solid var(--rule); }
.cv-item { margin-bottom: 10px; break-inside: avoid; page-break-inside: avoid; }
.cv-item-sm { margin-bottom: 6px; }
.cv-item-head { display: flex; justify-content: space-between; align-items: baseline; gap: 10px; }
.cv-item h3 { font-size: 10.5pt; }
.cv-date { flex-shrink: 0; font-size: 9pt; color: var(--muted); white-space: nowrap; }
.cv-org { font-size: 9.5pt; color: var(--muted); font-weight: 600; }
.cv-rich { margin-top: 3px; }
.cv-rich p + p, .cv-rich p + ul, .cv-rich ul + p { margin-top: 3px; }
.cv-rich ul { padding-left: 14px; list-style: disc; }
.cv-rich li { margin: 1px 0; }
.cv-result { font-weight: 600; margin-top: 3px; }
.cv-tech, .cv-link { font-size: 9pt; color: var(--muted); margin-top: 2px; }
.cv-tags { list-style: none; display: flex; flex-wrap: wrap; gap: 4px; }
.cv-tags li { font-size: 9pt; padding: 2px 8px; border-radius: 10px; border: 1px solid var(--rule); }
.cv-skill-group + .cv-skill-group { margin-top: 8px; }
.cv-skill-group h3 { font-size: 9.5pt; margin-bottom: 4px; }
.cv-line { margin-bottom: 2px; }
.cv-contact { list-style: none; }
.cv-contact li { margin-bottom: 3px; overflow-wrap: anywhere; }
.cv-contact span { display: block; font-size: 8pt; text-transform: uppercase; letter-spacing: .06em; opacity: .7; }
.cv-avatar { object-fit: cover; display: block; }
.cv-monogram { display: grid; place-items: center; font-weight: 800; }
`;

  const LAYOUT_CSS = {
    modern: `
.cv-page { display: grid; grid-template-columns: 66mm 1fr; }
.cv-side { background: var(--side-bg); color: var(--side-ink); padding: 16mm 8mm; }
.cv-main { padding: 16mm 12mm 14mm; }
.cv-side .cv-section > h2 { color: var(--side-ink); border-color: rgba(255,255,255,.25); }
.cv-side .cv-tags li { border-color: rgba(255,255,255,.3); }
.cv-side .cv-org, .cv-side .cv-date { color: inherit; opacity: .8; }
.cv-avatar, .cv-monogram { width: 34mm; height: 34mm; border-radius: 50%; margin: 0 auto 8mm; border: 3px solid rgba(255,255,255,.35); }
.cv-monogram { background: rgba(255,255,255,.12); font-size: 22pt; }
.cv-head { margin-bottom: 4mm; }
`,
    classic: `
.cv-page { padding: 16mm 18mm; }
.cv-head { display: flex; align-items: center; gap: 6mm; padding-bottom: 5mm; border-bottom: 2px solid var(--accent); }
.cv-avatar, .cv-monogram { width: 24mm; height: 24mm; border-radius: 4px; flex-shrink: 0; }
.cv-monogram { background: var(--accent); color: var(--accent-ink); font-size: 16pt; }
.cv-contact-inline { font-size: 9pt; color: var(--muted); margin-top: 4px; }
.cv-contact-inline b { color: var(--ink); font-weight: 600; }
.cv-tags li { border: none; padding: 0; }
.cv-tags li:not(:last-child)::after { content: " ·"; }
`,
    minimalist: `
.cv-page { padding: 18mm 18mm; }
.cv-head { display: flex; align-items: flex-end; justify-content: space-between; gap: 8mm; padding-bottom: 6mm; border-bottom: 1px solid var(--ink); }
.cv-head-id { display: flex; align-items: center; gap: 5mm; }
.cv-avatar, .cv-monogram { width: 20mm; height: 20mm; border-radius: 6mm; flex-shrink: 0; }
.cv-monogram { background: #f1f3f5; font-size: 14pt; }
h1 { font-size: 26pt; font-weight: 800; letter-spacing: -0.02em; }
.cv-title { color: var(--muted); font-weight: 500; }
.cv-head .cv-contact { text-align: right; font-size: 9pt; color: var(--muted); }
.cv-head .cv-contact span { display: none; }
.cv-cols { display: grid; grid-template-columns: 1fr 52mm; gap: 10mm; }
.cv-section > h2 { color: var(--muted); border: none; letter-spacing: .14em; font-size: 9pt; }
`,
    elegant: `
.cv-page { padding: 18mm 20mm; }
.cv-head { text-align: center; padding-bottom: 5mm; border-bottom: 1px solid var(--rule); }
.cv-avatar, .cv-monogram { width: 26mm; height: 26mm; border-radius: 50%; margin: 0 auto 4mm; }
.cv-monogram { background: var(--accent); color: var(--accent-ink); font-size: 16pt; }
h1 { font-size: 28pt; font-weight: 400; }
.cv-title { font-style: italic; font-weight: 400; }
.cv-contact-inline { font-size: 9pt; color: var(--muted); margin-top: 5px; }
.cv-contact-inline b { font-weight: 400; }
.cv-section > h2 { text-align: center; border: none; letter-spacing: .2em; font-weight: 400; }
.cv-section > h2::after { content: ""; display: block; width: 18mm; height: 1px; background: var(--accent); margin: 5px auto 0; }
.cv-tags { justify-content: center; }
.cv-skill-group h3, .cv-section > .cv-line, .cv-section > .cv-item-sm { text-align: center; }
.cv-section { margin-top: 12px; }
`
  };

  /** Préfixe chaque sélecteur par .cv-page (règles « plates », sans @media). */
  function scope(css) {
    return css.replace(/([^{}]+)\{([^{}]*)\}/g, (all, selectors, body) => {
      const scoped = selectors.split(',').map(sel => {
        sel = sel.trim();
        if (!sel) return sel;
        return sel.indexOf('.cv-page') === 0 ? sel : '.cv-page ' + sel;
      }).join(', ');
      return '\n' + scoped + ' {' + body + '}';
    });
  }

  /**
   * @param {object} raw     données du formulaire
   * @param {object} [opts]  { fragment: true } renvoie { css, html } à insérer dans une page existante
   */
  function generateCV(raw, opts) {
    opts = opts || {};
    const d = E.normalize(raw);
    const p = d.profile;
    let id = (raw && raw.design && raw.design.cvTemplate) || 'modern';
    id = TEMPLATES[id] ? id : (LEGACY[id] || 'modern');
    const tpl = TEMPLATES[id];
    const accent = d.design.cvAccent || tpl.accent;
    const accentText = ensureContrast(accent, '#ffffff', 4.5);
    const sideBg = ensureContrast(accent, '#ffffff', 7);
    const s = sections(d);

    const avatar = p.avatar
      ? '<img class="cv-avatar" src="' + esc(p.avatar) + '" alt="">'
      : '<div class="cv-monogram">' + esc(initials(p.name)) + '</div>';
    const identity = '<div><h1>' + esc(p.name) + '</h1>' +
      (p.title ? '<p class="cv-title">' + esc(p.title) + '</p>' : '') +
      (p.tagline ? '<p class="cv-tagline">' + esc(p.tagline) + '</p>' : '') + '</div>';
    const contacts = contactItems(p);
    const contactList = '<ul class="cv-contact">' + contacts.map(c => '<li><span>' + c[0] + '</span>' + c[1] + '</li>').join('') + '</ul>';
    const contactInline = '<p class="cv-contact-inline">' + contacts.map(c => c[1]).join(' &nbsp;·&nbsp; ') + '</p>';

    const mainBlocks = [
      block('Profil', s.profile),
      block('Expérience professionnelle', s.experience),
      block('Projets', s.projects),
      block('Formation', s.education)
    ];
    const sideBlocks = [
      block('Compétences', s.skills),
      block('Savoir-être', s.soft),
      block('Langues', s.langs),
      block('Certifications', s.certifications),
      block('Centres d’intérêt', s.hobbies),
      block('Références', s.refs)
    ];

    let body;
    if (id === 'modern') {
      body = '<aside class="cv-side">' + avatar + block('Contact', contactList) + sideBlocks.join('') + '</aside>' +
        '<main class="cv-main"><header class="cv-head">' + identity + '</header>' + mainBlocks.join('') + '</main>';
    } else if (id === 'minimalist') {
      body = '<header class="cv-head"><div class="cv-head-id">' + avatar + identity + '</div>' + contactList + '</header>' +
        '<div class="cv-cols"><main>' + mainBlocks.join('') + '</main><aside>' + sideBlocks.join('') + '</aside></div>';
    } else {
      body = '<header class="cv-head">' + (p.avatar || id === 'elegant' ? avatar : '') + '<div>' + identity + contactInline + '</div></header>' +
        mainBlocks.join('') + sideBlocks.join('');
    }

    const font = id === 'elegant' ? "Georgia, 'Times New Roman', serif"
      : id === 'classic' ? "'Helvetica Neue', Arial, sans-serif"
      : "'Segoe UI', 'Helvetica Neue', Arial, sans-serif";

    const css = '.cv-page{--font:' + font + ';--ink:#1f2328;--muted:#5b6470;--rule:#d8dde3;' +
      '--accent:' + accent + ';--accent-ink:' + inkOn(accent) + ';--accent-text:' + accentText + ';' +
      '--side-bg:' + sideBg + ';--side-ink:' + inkOn(sideBg) + ';}' + scope(BASE + LAYOUT_CSS[id]);
    const page = '<div class="cv-page cv-' + id + '">' + body + '</div>';
    if (opts.fragment) return { css, html: page };

    return '<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">' +
      '<title>CV — ' + esc(p.name) + '</title><style>' + STANDALONE + css + '</style></head>' +
      '<body>' + page + '</body></html>';
  }

  root.CV_TEMPLATES = TEMPLATES;
  root.generateCV = generateCV;
  root.generateCVTemplate = generateCV; // compatibilité avec l'ancien nom
  if (typeof module !== 'undefined' && module.exports) module.exports = { TEMPLATES, generateCV };
})(typeof window !== 'undefined' ? window : globalThis);
