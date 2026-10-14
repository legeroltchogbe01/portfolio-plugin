/**
 * Portfolio Studio — moteur de génération
 *
 * Un seul générateur produit le HTML, le CSS et le JS de tous les portfolios.
 * Les thèmes (themes.js) ne fournissent que des polices, des palettes clair/sombre
 * et un complément de CSS : toute correction faite ici profite à tous les thèmes.
 *
 * Fonctionne dans le navigateur (variables globales) et dans Node (module.exports).
 */
(function (root) {
  'use strict';

  /* ==========================================================
     Outils de sécurité et de texte
     ========================================================== */

  function esc(value) {
    if (value === undefined || value === null) return '';
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /**
   * Renvoie une URL sûre ou une chaîne vide.
   * - http(s) uniquement pour les liens web (javascript:, data:, etc. sont refusés)
   * - « github.com/moi » devient « https://github.com/moi »
   */
  function safeUrl(raw) {
    if (!raw) return '';
    let s = String(raw).trim();
    if (!s) return '';
    if (/^\/\//.test(s)) s = 'https:' + s;
    if (!/^[a-z][a-z0-9+.-]*:/i.test(s)) {
      if (/^[^\s/]+\.[a-z]{2,}([/?#].*)?$/i.test(s)) s = 'https://' + s;
      else return '';
    }
    try {
      const u = new URL(s);
      if (u.protocol !== 'http:' && u.protocol !== 'https:') return '';
      return u.href;
    } catch (e) {
      return '';
    }
  }

  function isEmail(s) {
    return /^[^\s@<>"']+@[^\s@<>"']+\.[^\s@<>"']+$/.test(String(s || '').trim());
  }

  function safeImage(src) {
    if (!src) return '';
    const s = String(src).trim();
    if (/^data:image\/(png|jpe?g|webp|gif);base64,[a-z0-9+/=\s]+$/i.test(s)) return s;
    return safeUrl(s);
  }

  function phoneDigits(phone) {
    return String(phone || '').replace(/[^\d]/g, '');
  }

  function prettyUrl(url) {
    return String(url).replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
  }

  function initials(name) {
    const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return '?';
    const first = parts[0][0] || '';
    const last = parts.length > 1 ? parts[parts.length - 1][0] : (parts[0][1] || '');
    return (first + last).toUpperCase();
  }

  function splitList(str) {
    return String(str || '').split(/[,;\n]/).map(s => s.trim()).filter(Boolean);
  }

  function truncate(str, n) {
    const s = String(str || '').replace(/\s+/g, ' ').trim();
    return s.length > n ? s.slice(0, n - 1).replace(/\s+\S*$/, '') + '…' : s;
  }

  /**
   * Texte libre -> HTML sûr.
   * Les lignes commençant par « - », « • » ou « * » deviennent une liste,
   * les lignes vides séparent les paragraphes.
   */
  function richText(text) {
    const lines = String(text || '').replace(/\r\n?/g, '\n').split('\n');
    const out = [];
    let para = [];
    let list = [];
    const flushPara = () => {
      if (para.length) out.push('<p>' + para.map(esc).join('<br>') + '</p>');
      para = [];
    };
    const flushList = () => {
      if (list.length) out.push('<ul>' + list.map(li => '<li>' + esc(li) + '</li>').join('') + '</ul>');
      list = [];
    };
    lines.forEach(raw => {
      const line = raw.trim();
      const bullet = line.match(/^[-•*–]\s*(.+)$/);
      if (!line) { flushPara(); flushList(); }
      else if (bullet) { flushPara(); list.push(bullet[1]); }
      else { flushList(); para.push(line); }
    });
    flushPara();
    flushList();
    return out.join('');
  }

  /* ==========================================================
     Couleurs : contraste garanti quel que soit l'accent choisi
     ========================================================== */

  function normalizeHex(hex, fallback) {
    let h = String(hex || '').trim();
    if (/^#[0-9a-f]{3}$/i.test(h)) h = '#' + h.slice(1).split('').map(c => c + c).join('');
    return /^#[0-9a-f]{6}$/i.test(h) ? h.toLowerCase() : fallback;
  }

  function hexToRgb(hex) {
    const n = parseInt(hex.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }

  function rgbToHex(rgb) {
    return '#' + rgb.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
  }

  function luminance(hex) {
    return hexToRgb(hex)
      .map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); })
      .reduce((acc, v, i) => acc + v * [0.2126, 0.7152, 0.0722][i], 0);
  }

  function contrast(a, b) {
    const la = luminance(a), lb = luminance(b);
    return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
  }

  function mix(a, b, t) {
    const A = hexToRgb(a), B = hexToRgb(b);
    return rgbToHex(A.map((v, i) => v + (B[i] - v) * t));
  }

  /** Éclaircit ou assombrit `color` jusqu'à atteindre le contraste voulu sur `bg`. */
  function ensureContrast(color, bg, ratio) {
    if (contrast(color, bg) >= ratio) return color;
    const target = luminance(bg) < 0.5 ? '#ffffff' : '#000000';
    for (let t = 0.05; t <= 1; t += 0.05) {
      const c = mix(color, target, t);
      if (contrast(c, bg) >= ratio) return c;
    }
    return target;
  }

  function inkOn(bg) {
    return contrast('#ffffff', bg) >= contrast('#111111', bg) ? '#ffffff' : '#111111';
  }

  /* ==========================================================
     Normalisation des données du formulaire
     ========================================================== */

  function str(v) { return v === undefined || v === null ? '' : String(v).trim(); }

  function normalize(raw) {
    raw = raw || {};
    const p = raw.profile || {};
    const design = raw.design || {};
    const arr = v => (Array.isArray(v) ? v : []);

    const profile = {
      name: str(p.name) || 'Votre nom',
      title: str(p.title),
      tagline: str(p.tagline),
      bio: str(p.bio),
      email: isEmail(p.email) ? str(p.email) : '',
      phone: str(p.phone),
      website: safeUrl(p.website),
      location: str(p.location),
      relocation: str(p.relocation),
      availability: str(p.availability),
      contract: str(p.contract),
      experienceYears: str(p.experience),
      age: str(p.age),
      address: str(p.address),
      avatar: safeImage(p.avatar),
      avatarAlt: str(p.avatarAlt),
      github: safeUrl(p.github),
      linkedin: safeUrl(p.linkedin),
      twitter: safeUrl(p.twitter),
      facebook: safeUrl(p.facebook)
    };

    // Anciennes versions : « languages » et « hobbies » en texte libre dans le profil
    let languages = arr(raw.languagesList).map(l => ({ name: str(l.name), level: str(l.level) })).filter(l => l.name);
    if (!languages.length && p.languages) languages = splitList(p.languages).map(n => ({ name: n, level: '' }));
    let hobbies = arr(raw.hobbiesList).map(h => str(h.name)).filter(Boolean);
    if (!hobbies.length && p.hobbies) hobbies = splitList(p.hobbies);

    return {
      profile,
      skills: arr(raw.skills).map(s => ({ name: str(s.name), group: str(s.group) })).filter(s => s.name),
      softSkills: arr(raw.softSkills).map(s => str(s.name || s)).filter(Boolean),
      languages,
      hobbies,
      references: arr(raw.references).map(r => ({ name: str(r.name), role: str(r.role), contact: str(r.contact) })).filter(r => r.name),
      projects: arr(raw.projects).map(pr => ({
        title: str(pr.title),
        category: str(pr.category),
        description: str(pr.description),
        technologies: splitList(pr.technologies),
        result: str(pr.result),
        liveUrl: safeUrl(pr.liveUrl),
        githubUrl: safeUrl(pr.githubUrl),
        videoUrl: safeUrl(pr.videoUrl),
        image: safeImage(pr.image),
        date: str(pr.date),
        role: str(pr.role)
      })).filter(pr => pr.title),
      experience: arr(raw.experience && raw.experience.length ? raw.experience : raw.timeline).map(t => ({
        role: str(t.role),
        organization: str(t.organization),
        startDate: str(t.startDate),
        endDate: str(t.endDate),
        description: str(t.description),
        achievements: str(t.achievements)
      })).filter(t => t.role),
      education: arr(raw.education).map(e => ({
        degree: str(e.degree),
        institution: str(e.institution),
        startDate: str(e.startDate),
        endDate: str(e.endDate)
      })).filter(e => e.degree),
      certifications: arr(raw.certificationsList && raw.certificationsList.length ? raw.certificationsList : raw.certifications)
        .map(c => ({ name: str(c.name), authority: str(c.authority), date: str(c.date) })).filter(c => c.name),
      design: {
        accent: normalizeHex(design.accentColor, ''),
        accent2: normalizeHex(design.secondaryColor, ''),
        cvAccent: normalizeHex(design.cvAccent, ''),
        cvTemplate: str(design.cvTemplate)
      }
    };
  }

  /* ==========================================================
     Images : data URL -> fichier dans le ZIP
     ========================================================== */

  function imageAsset(src, baseName) {
    const m = String(src || '').match(/^data:image\/(png|jpe?g|webp|gif);base64,(.+)$/i);
    if (!m) return null;
    const ext = m[1].toLowerCase() === 'jpeg' ? 'jpg' : m[1].toLowerCase();
    return { filename: baseName + '.' + ext, path: 'images/' + baseName + '.' + ext, base64: m[2].replace(/\s/g, '') };
  }

  /* ==========================================================
     Construction du HTML
     ========================================================== */

  function dateRange(start, end) {
    if (start && end) return esc(start) + ' — ' + esc(end);
    if (start) return esc(start) + ' — aujourd’hui';
    return esc(end);
  }

  function icon(cls) { return '<i class="' + cls + '" aria-hidden="true"></i>'; }

  function socialLinks(p) {
    const items = [];
    if (p.github) items.push(['GitHub', p.github, 'fab fa-github']);
    if (p.linkedin) items.push(['LinkedIn', p.linkedin, 'fab fa-linkedin-in']);
    if (p.twitter) items.push(['X / Twitter', p.twitter, 'fab fa-x-twitter']);
    if (p.facebook) items.push(['Facebook', p.facebook, 'fab fa-facebook-f']);
    if (p.website) items.push(['Site web', p.website, 'fas fa-globe']);
    return items;
  }

  function buildHero(d, avatarSrc, sections) {
    const p = d.profile;
    const facts = [];
    if (p.location) facts.push(['fas fa-location-dot', p.location, p.relocation]);
    if (p.experienceYears) facts.push(['fas fa-briefcase', p.experienceYears + (/\D/.test(p.experienceYears) ? '' : (Number(p.experienceYears) > 1 ? ' ans' : ' an')) + ' d’expérience', '']);
    if (p.contract) facts.push(['fas fa-file-signature', p.contract, '']);
    if (d.languages.length) facts.push(['fas fa-language', d.languages.map(l => l.name).join(', '), '']);

    const wa = phoneDigits(p.phone);
    const primary = sections.includes('projets')
      ? '<a class="btn btn-primary" href="#projets">Voir mes projets ' + icon('fas fa-arrow-down') + '</a>'
      : '<a class="btn btn-primary" href="#contact">Me contacter ' + icon('fas fa-arrow-right') + '</a>';
    let secondary = '';
    if (wa.length >= 8) secondary = '<a class="btn btn-ghost" href="https://wa.me/' + wa + '" target="_blank" rel="noopener">' + icon('fab fa-whatsapp') + ' WhatsApp</a>';
    else if (p.email) secondary = '<a class="btn btn-ghost" href="mailto:' + esc(p.email) + '">' + icon('fas fa-envelope') + ' Écrire un email</a>';

    const status = p.availability
      ? '<p class="status"><span class="status-dot" aria-hidden="true"></span>Disponibilité : ' + esc(p.availability) + '</p>'
      : '';

    const media = avatarSrc
      ? '<figure class="portrait"><img src="' + esc(avatarSrc) + '" alt="' + esc(p.avatarAlt || 'Portrait de ' + p.name) + '" fetchpriority="high"></figure>'
      : '<div class="portrait portrait-monogram" aria-hidden="true"><span>' + esc(initials(p.name)) + '</span></div>';

    return '' +
      '<section class="hero" id="accueil">' +
        '<div class="wrap hero-grid">' +
          '<div class="hero-text">' +
            status +
            (p.title ? '<p class="hero-kicker">' + esc(p.title) + '</p>' : '') +
            '<h1 class="hero-title">' + esc(p.name) + '</h1>' +
            (p.tagline ? '<p class="hero-tagline">' + esc(p.tagline) + '</p>' : '') +
            (p.bio ? '<div class="hero-bio rich">' + richText(p.bio) + '</div>' : '') +
            '<div class="hero-cta">' + primary + secondary + '</div>' +
            (facts.length ? '<ul class="facts">' + facts.map(f =>
              '<li>' + icon(f[0]) + '<span><strong>' + esc(f[1]) + '</strong>' + (f[2] ? '<small>' + esc(f[2]) + '</small>' : '') + '</span></li>'
            ).join('') + '</ul>' : '') +
          '</div>' +
          '<div class="hero-media">' + media + '</div>' +
        '</div>' +
      '</section>';
  }

  function sectionHead(num, eyebrow, title) {
    return '<header class="section-head"><p class="eyebrow"><span class="eyebrow-num">' + num + '</span>' + esc(eyebrow) + '</p><h2>' + esc(title) + '</h2></header>';
  }

  function buildProjects(d, images, isExport, num) {
    const cards = d.projects.map((pr, i) => {
      let src = pr.image;
      if (src && isExport) {
        const asset = imageAsset(src, 'project-' + (i + 1));
        if (asset) { images.push(asset); src = asset.path; }
      }
      const link = pr.liveUrl || pr.githubUrl;
      const media = src
        ? (link
            ? '<a class="project-media" href="' + esc(link) + '" target="_blank" rel="noopener" tabindex="-1"><img src="' + esc(src) + '" alt="Aperçu du projet ' + esc(pr.title) + '" loading="lazy"></a>'
            : '<div class="project-media"><img src="' + esc(src) + '" alt="Aperçu du projet ' + esc(pr.title) + '" loading="lazy"></div>')
        : '';
      const meta = [];
      if (pr.category) meta.push('<span class="tag">' + esc(pr.category) + '</span>');
      if (pr.date) meta.push('<span>' + icon('far fa-calendar') + ' ' + esc(pr.date) + '</span>');
      if (pr.role) meta.push('<span>' + icon('far fa-user') + ' ' + esc(pr.role) + '</span>');
      const links = [];
      if (pr.liveUrl) links.push('<a class="link-strong" href="' + esc(pr.liveUrl) + '" target="_blank" rel="noopener">Voir le projet ' + icon('fas fa-arrow-up-right-from-square') + '</a>');
      if (pr.githubUrl) links.push('<a href="' + esc(pr.githubUrl) + '" target="_blank" rel="noopener">' + icon('fab fa-github') + ' Code</a>');
      if (pr.videoUrl) links.push('<a href="' + esc(pr.videoUrl) + '" target="_blank" rel="noopener">' + icon('fas fa-circle-play') + ' Démo vidéo</a>');
      return '' +
        '<article class="project reveal' + (media ? '' : ' no-media') + '">' +
          media +
          '<div class="project-body">' +
            (meta.length ? '<div class="project-meta">' + meta.join('') + '</div>' : '') +
            '<h3>' + esc(pr.title) + '</h3>' +
            (pr.description ? '<div class="rich">' + richText(pr.description) + '</div>' : '') +
            (pr.result ? '<p class="result">' + icon('fas fa-chart-line') + ' ' + esc(pr.result) + '</p>' : '') +
            (pr.technologies.length ? '<ul class="stack" aria-label="Technologies">' + pr.technologies.map(t => '<li>' + esc(t) + '</li>').join('') + '</ul>' : '') +
            (links.length ? '<div class="project-links">' + links.join('') + '</div>' : '') +
          '</div>' +
        '</article>';
    }).join('');
    return '<section class="section" id="projets"><div class="wrap">' + sectionHead(num, 'Projets', 'Projets sélectionnés') + '<div class="projects">' + cards + '</div></div></section>';
  }

  function buildExperience(d, num) {
    const items = d.experience.map(t =>
      '<li class="entry reveal">' +
        '<p class="entry-date">' + dateRange(t.startDate, t.endDate) + '</p>' +
        '<div class="entry-body">' +
          '<h3>' + esc(t.role) + '</h3>' +
          (t.organization ? '<p class="entry-org">' + esc(t.organization) + '</p>' : '') +
          (t.description ? '<div class="rich">' + richText(t.description) + '</div>' : '') +
          (t.achievements ? '<p class="result">' + icon('fas fa-chart-line') + ' ' + esc(t.achievements) + '</p>' : '') +
        '</div>' +
      '</li>'
    ).join('');
    return '<section class="section section-alt" id="parcours"><div class="wrap">' + sectionHead(num, 'Parcours', 'Expérience professionnelle') + '<ol class="timeline">' + items + '</ol></div></section>';
  }

  function chipGroup(title, iconCls, chips) {
    return '<div class="skill-group reveal"><h3>' + icon(iconCls) + ' ' + esc(title) + '</h3><ul class="chips">' +
      chips.map(c => '<li>' + c + '</li>').join('') + '</ul></div>';
  }

  function buildSkills(d, num) {
    const groups = [];
    const byGroup = new Map();
    d.skills.forEach(s => {
      const g = s.group || 'Compétences techniques';
      if (!byGroup.has(g)) byGroup.set(g, []);
      byGroup.get(g).push(esc(s.name));
    });
    byGroup.forEach((chips, g) => groups.push(chipGroup(g, 'fas fa-code', chips)));
    if (d.softSkills.length) groups.push(chipGroup('Savoir-être', 'fas fa-people-group', d.softSkills.map(esc)));
    if (d.languages.length) groups.push(chipGroup('Langues', 'fas fa-language', d.languages.map(l => esc(l.name) + (l.level ? ' <span class="chip-note">' + esc(l.level) + '</span>' : ''))));
    if (d.hobbies.length) groups.push(chipGroup('Centres d’intérêt', 'fas fa-heart', d.hobbies.map(esc)));
    return '<section class="section" id="competences"><div class="wrap">' + sectionHead(num, 'Compétences', 'Ce que j’apporte') + '<div class="skill-groups">' + groups.join('') + '</div></div></section>';
  }

  function buildEducation(d, num) {
    const edu = d.education.map(e =>
      '<li class="entry reveal">' +
        '<p class="entry-date">' + dateRange(e.startDate, e.endDate) + '</p>' +
        '<div class="entry-body"><h3>' + esc(e.degree) + '</h3>' + (e.institution ? '<p class="entry-org">' + esc(e.institution) + '</p>' : '') + '</div>' +
      '</li>'
    ).join('');
    const certs = d.certifications.map(c =>
      '<li class="cert reveal"><span class="cert-icon">' + icon('fas fa-award') + '</span><div><h3>' + esc(c.name) + '</h3><p>' +
        [c.authority, c.date].filter(Boolean).map(esc).join(' · ') + '</p></div></li>'
    ).join('');
    const title = d.education.length && d.certifications.length ? 'Formation & certifications'
      : (d.education.length ? 'Formation' : 'Certifications');
    return '<section class="section section-alt" id="formation"><div class="wrap">' + sectionHead(num, 'Formation', title) +
      (edu ? '<ol class="timeline">' + edu + '</ol>' : '') +
      (certs ? '<ul class="certs">' + certs + '</ul>' : '') +
      '</div></section>';
  }

  function buildContact(d, num) {
    const p = d.profile;
    const wa = phoneDigits(p.phone);
    const actions = [];
    if (p.email) actions.push('<a class="btn btn-primary" href="mailto:' + esc(p.email) + '">' + icon('fas fa-envelope') + ' ' + esc(p.email) + '</a>');
    if (wa.length >= 8) actions.push('<a class="btn btn-ghost" href="https://wa.me/' + wa + '" target="_blank" rel="noopener">' + icon('fab fa-whatsapp') + ' ' + esc(p.phone) + '</a>');
    else if (p.phone) actions.push('<a class="btn btn-ghost" href="tel:' + esc(p.phone.replace(/[^\d+]/g, '')) + '">' + icon('fas fa-phone') + ' ' + esc(p.phone) + '</a>');
    const socials = socialLinks(p);
    return '<section class="section" id="contact"><div class="wrap"><div class="contact-card reveal">' +
      '<p class="eyebrow"><span class="eyebrow-num">' + num + '</span>Contact</p>' +
      '<h2>Travaillons ensemble</h2>' +
      '<p class="contact-lead">Un projet, un poste, une question ? Écrivez-moi, je réponds rapidement.</p>' +
      (actions.length ? '<div class="contact-actions">' + actions.join('') + '</div>' : '') +
      (socials.length ? '<ul class="socials">' + socials.map(s =>
        '<li><a href="' + esc(s[1]) + '" target="_blank" rel="noopener" aria-label="' + esc(s[0]) + '" title="' + esc(s[0]) + '">' + icon(s[2]) + '</a></li>').join('') + '</ul>' : '') +
      '</div></div></section>';
  }

  /* ==========================================================
     CSS : variables du thème + base commune + complément du thème
     ========================================================== */

  function paletteCss(palette, accent, accent2) {
    const fill = ensureContrast(accent, palette.bg, 3);
    const text = ensureContrast(accent, palette.bg, 4.5);
    const vars = Object.assign({}, palette, {
      accent: fill,
      'accent-ink': inkOn(fill),
      'accent-text': text,
      'accent-soft': mix(palette.bg, accent, luminance(palette.bg) < 0.5 ? 0.16 : 0.1),
      'accent-2': accent2 || accent
    });
    return Object.keys(vars).map(k => '  --' + k.replace(/[A-Z]/g, m => '-' + m.toLowerCase()) + ': ' + vars[k] + ';').join('\n');
  }

  const BASE_CSS = `
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; scroll-padding-top: calc(var(--header-h) + 16px); -webkit-text-size-adjust: 100%; }
body {
  background: var(--bg); color: var(--text);
  font-family: var(--font-body); font-size: 1rem; line-height: 1.65;
  overflow-x: hidden; -webkit-font-smoothing: antialiased;
  transition: background-color .3s, color .3s;
}
img { display: block; max-width: 100%; height: auto; }
a { color: inherit; }
ul, ol { list-style: none; }
h1, h2, h3 { font-family: var(--font-display); line-height: 1.12; letter-spacing: var(--heading-tracking); font-weight: var(--heading-weight); }
:focus-visible { outline: 2px solid var(--accent-text); outline-offset: 3px; border-radius: 4px; }
.wrap { width: 100%; max-width: var(--wrap); margin: 0 auto; padding: 0 24px; }
.skip-link { position: absolute; left: 16px; top: -60px; z-index: 200; background: var(--accent); color: var(--accent-ink); padding: 10px 16px; border-radius: var(--radius-sm); font-weight: 700; text-decoration: none; }
.skip-link:focus { top: 16px; }

/* Texte riche (paragraphes + listes) */
.rich p + p, .rich p + ul, .rich ul + p { margin-top: .6em; }
.rich ul { display: grid; gap: 6px; }
.rich li { position: relative; padding-left: 20px; }
.rich li::before { content: ""; position: absolute; left: 0; top: .72em; width: 8px; height: 2px; border-radius: 2px; background: var(--accent-text); }

/* Boutons */
.btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 10px;
  padding: 13px 22px; border-radius: var(--radius-btn); border: 1.5px solid transparent;
  font-weight: 700; font-size: .95rem; text-decoration: none; line-height: 1.2;
  transition: transform .2s, background-color .2s, border-color .2s, color .2s;
}
.btn:hover { transform: translateY(-2px); }
.btn-primary { background: var(--accent); color: var(--accent-ink); }
.btn-primary:hover { filter: brightness(1.08); }
.btn-ghost { background: var(--surface); color: var(--text); border-color: var(--border); }
.btn-ghost:hover { border-color: var(--accent-text); }
.icon-btn {
  width: 42px; height: 42px; display: grid; place-items: center; flex-shrink: 0;
  border-radius: 50%; border: 1px solid var(--border); background: var(--surface);
  color: var(--text); cursor: pointer; font-size: 1rem; transition: border-color .2s;
}
.icon-btn:hover { border-color: var(--accent-text); }

/* En-tête */
.site-header {
  position: fixed; inset: 0 0 auto 0; z-index: 100; height: var(--header-h);
  background: color-mix(in srgb, var(--bg) 85%, transparent);
  -webkit-backdrop-filter: blur(14px); backdrop-filter: blur(14px);
  border-bottom: 1px solid transparent; transition: border-color .3s;
}
.site-header.scrolled { border-bottom-color: var(--border); }
.header-inner { height: 100%; display: flex; align-items: center; gap: 24px; }
.brand { display: flex; align-items: center; gap: 10px; text-decoration: none; min-width: 0; }
.brand-mark {
  width: 36px; height: 36px; display: grid; place-items: center; flex-shrink: 0;
  border-radius: var(--radius-sm); background: var(--accent); color: var(--accent-ink);
  font-family: var(--font-display); font-weight: 800; font-size: .85rem;
}
.brand-name { font-family: var(--font-display); font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.site-nav { display: flex; align-items: center; gap: 28px; margin-left: auto; }
.site-nav a { color: var(--text-soft); text-decoration: none; font-weight: 600; font-size: .93rem; transition: color .2s; }
.site-nav a:hover, .site-nav a.active { color: var(--text); }
.site-nav .nav-cta { background: var(--accent); color: var(--accent-ink); padding: 9px 18px; border-radius: var(--radius-btn); }
.site-nav .nav-cta:hover { color: var(--accent-ink); filter: brightness(1.08); }
.header-actions { display: flex; gap: 8px; }
.menu-btn { display: none; }
.icon-sun { display: none; }
html[data-mode="dark"] .icon-moon { display: none; }
html[data-mode="dark"] .icon-sun { display: inline; }

/* Hero */
.hero { position: relative; padding: calc(var(--header-h) + 72px) 0 96px; }
.hero::before {
  content: ""; position: absolute; inset: 0; z-index: -1; pointer-events: none;
  background: radial-gradient(55% 50% at 85% 15%, var(--accent-soft), transparent 70%);
}
.hero-grid { display: grid; grid-template-columns: minmax(0, 1.3fr) minmax(0, .7fr); gap: 64px; align-items: center; }
.status {
  display: inline-flex; align-items: center; gap: 10px; margin-bottom: 24px;
  padding: 7px 14px; border: 1px solid var(--border); border-radius: 999px; background: var(--surface);
  font-size: .85rem; font-weight: 600; color: var(--text-soft);
}
.status-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--success); box-shadow: 0 0 0 4px color-mix(in srgb, var(--success) 25%, transparent); }
.hero-kicker { font-weight: 700; color: var(--accent-text); margin-bottom: 10px; letter-spacing: .02em; }
.hero-title { font-size: clamp(2.4rem, 6vw, 4.4rem); margin-bottom: 18px; overflow-wrap: anywhere; }
.hero-tagline { font-family: var(--font-display); font-size: clamp(1.2rem, 2.4vw, 1.6rem); line-height: 1.3; color: var(--text); margin-bottom: 18px; max-width: 30ch; }
.hero-bio { color: var(--text-soft); font-size: 1.05rem; max-width: 60ch; margin-bottom: 32px; }
.hero-cta { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 40px; }
.facts { display: flex; flex-wrap: wrap; gap: 20px 32px; padding-top: 26px; border-top: 1px solid var(--border); }
.facts li { display: flex; gap: 12px; align-items: flex-start; }
.facts i { color: var(--accent-text); margin-top: 5px; }
.facts span { display: flex; flex-direction: column; }
.facts strong { font-size: .95rem; }
.facts small { font-size: .85rem; color: var(--text-muted); }
.hero-media { justify-self: center; width: 100%; max-width: 360px; }
.portrait {
  aspect-ratio: 4 / 5; border-radius: var(--radius-lg); overflow: hidden;
  background: var(--surface-2); border: 1px solid var(--border); box-shadow: var(--shadow);
}
.portrait img { width: 100%; height: 100%; object-fit: cover; object-position: center 20%; }
.portrait-monogram { display: grid; place-items: center; background: linear-gradient(135deg, var(--accent), var(--accent-2)); }
.portrait-monogram span { font-family: var(--font-display); font-size: clamp(4rem, 10vw, 6rem); font-weight: 800; color: var(--accent-ink); opacity: .9; }

/* Sections */
.section { padding: 104px 0; }
.section-alt { background: var(--bg-alt); }
.section-head { margin-bottom: 48px; max-width: 720px; }
.eyebrow { display: flex; gap: 10px; align-items: baseline; font-size: .8rem; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: var(--accent-text); margin-bottom: 12px; }
.eyebrow-num { opacity: .7; }
.eyebrow-num::after { content: " —"; }
.section-head h2, .contact-card h2 { font-size: clamp(1.8rem, 3.6vw, 2.7rem); }

/* Projets */
.projects { display: grid; gap: 32px; }
.project {
  display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
  background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); overflow: hidden;
  transition: border-color .3s;
}
.project:hover { border-color: color-mix(in srgb, var(--accent-text) 45%, var(--border)); }
.project.no-media { grid-template-columns: 1fr; }
.project:nth-child(even) .project-media { order: 2; }
.project-media { display: flex; align-items: center; padding: 20px; background: var(--surface-2); overflow: hidden; }
.project-media img { width: 100%; border-radius: var(--radius-sm); border: 1px solid var(--border); box-shadow: var(--shadow); transition: transform .6s ease; }
.project:hover .project-media img { transform: scale(1.03); }
.project-body { padding: 32px; display: flex; flex-direction: column; min-width: 0; }
.project-meta { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 16px; margin-bottom: 12px; font-size: .82rem; color: var(--text-muted); }
.tag { background: var(--accent-soft); color: var(--accent-text); padding: 4px 10px; border-radius: 999px; font-weight: 700; font-size: .75rem; }
.project h3 { font-size: 1.55rem; margin-bottom: 10px; }
.project .rich { color: var(--text-soft); margin-bottom: 16px; font-size: .97rem; }
.result { display: flex; gap: 8px; align-items: baseline; font-weight: 700; font-size: .92rem; color: var(--success); margin-bottom: 16px; }
.stack { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 22px; }
.stack li { font-size: .78rem; font-weight: 600; color: var(--text-soft); border: 1px solid var(--border); padding: 4px 10px; border-radius: 6px; }
.project-links { display: flex; flex-wrap: wrap; gap: 10px 22px; margin-top: auto; }
.project-links a { display: inline-flex; gap: 8px; align-items: center; text-decoration: none; font-weight: 700; font-size: .92rem; color: var(--text-soft); transition: color .2s; }
.project-links a:hover { color: var(--text); }
.project-links .link-strong { color: var(--accent-text); }

/* Parcours / formation */
.timeline { display: grid; gap: 16px; }
.entry { display: grid; grid-template-columns: 190px minmax(0, 1fr); gap: 28px; padding: 28px; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); }
.entry-date { font-weight: 700; font-size: .9rem; color: var(--accent-text); padding-top: 3px; }
.entry h3 { font-size: 1.25rem; margin-bottom: 4px; }
.entry-org { color: var(--text-muted); font-weight: 600; margin-bottom: 10px; }
.entry .rich { color: var(--text-soft); font-size: .96rem; }
.entry .result { margin: 14px 0 0; }
.certs { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px; margin-top: 16px; }
.cert { display: flex; align-items: center; gap: 16px; padding: 22px; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); }
.cert-icon { width: 46px; height: 46px; flex-shrink: 0; display: grid; place-items: center; border-radius: 50%; background: var(--accent); color: var(--accent-ink); font-size: 1.1rem; }
.cert h3 { font-size: 1.05rem; margin-bottom: 2px; }
.cert p { color: var(--text-muted); font-size: .88rem; }

/* Compétences */
.skill-groups { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 18px; }
.skill-group { padding: 26px; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); }
.skill-group h3 { display: flex; align-items: center; gap: 10px; font-size: 1.15rem; margin-bottom: 16px; }
.skill-group h3 i { color: var(--accent-text); font-size: .95rem; }
.chips { display: flex; flex-wrap: wrap; gap: 8px; }
.chips li { font-size: .84rem; font-weight: 600; background: var(--surface-2); border: 1px solid var(--border); padding: 6px 12px; border-radius: 999px; }
.chip-note { color: var(--text-muted); font-weight: 500; }

/* Contact */
.contact-card {
  text-align: center; padding: 72px 32px; border-radius: var(--radius-lg); border: 1px solid var(--border);
  background: radial-gradient(70% 90% at 50% 0%, var(--accent-soft), transparent 70%), var(--surface);
}
.contact-card .eyebrow { justify-content: center; }
.contact-card h2 { margin-bottom: 12px; }
.contact-lead { color: var(--text-soft); margin: 0 auto 30px; max-width: 46ch; }
.contact-actions { display: flex; flex-wrap: wrap; justify-content: center; gap: 12px; margin-bottom: 28px; }
.contact-actions .btn { max-width: 100%; overflow-wrap: anywhere; }
.socials { display: flex; justify-content: center; flex-wrap: wrap; gap: 10px; }
.socials a { width: 44px; height: 44px; display: grid; place-items: center; border-radius: 50%; border: 1px solid var(--border); color: var(--text-soft); text-decoration: none; transition: color .2s, border-color .2s; }
.socials a:hover { color: var(--text); border-color: var(--accent-text); }

/* Pied de page */
.site-footer { padding: 32px 0; border-top: 1px solid var(--border); }
.footer-inner { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; font-size: .88rem; color: var(--text-muted); }
.footer-inner a { text-decoration: none; font-weight: 600; }
.footer-inner a:hover { color: var(--text); }

/* Apparition au défilement */
.js .reveal { opacity: 0; transform: translateY(22px); transition: opacity .7s ease, transform .7s cubic-bezier(.2,.7,.2,1); }
.js .reveal.is-in { opacity: 1; transform: none; }
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  *, *::before, *::after { transition: none !important; animation: none !important; }
  .js .reveal { opacity: 1; transform: none; }
}

/* Responsive */
@media (max-width: 980px) {
  .hero-grid { grid-template-columns: 1fr; gap: 48px; }
  .hero-media { max-width: 300px; justify-self: start; }
  .project, .project:nth-child(even) { grid-template-columns: 1fr; }
  .project:nth-child(even) .project-media { order: 0; }
  .entry { grid-template-columns: 1fr; gap: 6px; }
}
@media (max-width: 760px) {
  :root { --header-h: 64px; }
  .menu-btn { display: grid; }
  .site-nav {
    position: fixed; top: var(--header-h); left: 0; right: 0;
    flex-direction: column; align-items: stretch; gap: 2px; padding: 12px 16px 20px;
    background: var(--bg); border-bottom: 1px solid var(--border);
    opacity: 0; visibility: hidden; transform: translateY(-8px);
    transition: opacity .2s, transform .2s, visibility .2s;
  }
  .site-nav.open { opacity: 1; visibility: visible; transform: none; }
  .site-nav a { padding: 12px 8px; font-size: 1rem; }
  .site-nav .nav-cta { text-align: center; margin-top: 8px; padding: 12px; }
  .header-actions { margin-left: auto; }
  .wrap { padding: 0 16px; }
  .hero { padding: calc(var(--header-h) + 40px) 0 72px; }
  .hero-cta { flex-direction: column; }
  .hero-cta .btn { width: 100%; }
  .facts { flex-direction: column; gap: 16px; }
  .section { padding: 76px 0; }
  .section-head { margin-bottom: 32px; }
  .project-media { padding: 14px; }
  .project-body, .entry, .skill-group { padding: 22px 18px; }
  .contact-card { padding: 52px 18px; }
  .contact-actions .btn { width: 100%; }
}
`;

  const BASE_JS = `(function () {
  var root = document.documentElement;
  root.classList.add('js');

  var KEY = 'portfolio-mode';
  var toggle = document.getElementById('mode-toggle');
  if (toggle) toggle.addEventListener('click', function () {
    var next = root.getAttribute('data-mode') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-mode', next);
    try { localStorage.setItem(KEY, next); } catch (e) {}
  });

  var nav = document.getElementById('site-nav');
  var menu = document.getElementById('menu-toggle');
  function setMenu(open) {
    if (!nav || !menu) return;
    nav.classList.toggle('open', open);
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
    menu.innerHTML = open ? '<i class="fas fa-xmark" aria-hidden="true"></i>' : '<i class="fas fa-bars" aria-hidden="true"></i>';
  }
  if (menu) menu.addEventListener('click', function () { setMenu(!nav.classList.contains('open')); });
  if (nav) nav.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

  var header = document.querySelector('.site-header');
  function onScroll() { if (header) header.classList.toggle('scrolled', window.scrollY > 8); }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-in'); ro.unobserve(en.target); } });
    }, { threshold: 0.1 });
    reveals.forEach(function (el) { ro.observe(el); });

    if (nav) {
      var links = Array.prototype.slice.call(nav.querySelectorAll('a[href^="#"]'));
      var no = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) links.forEach(function (a) { a.classList.toggle('active', a.getAttribute('href') === '#' + en.target.id); });
        });
      }, { rootMargin: '-45% 0px -50% 0px' });
      links.forEach(function (a) { var s = document.querySelector(a.getAttribute('href')); if (s) no.observe(s); });
    }
  } else {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  }

  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
})();`;

  /* ==========================================================
     Point d'entrée : génère le portfolio complet
     ========================================================== */

  /**
   * @param {object} raw      données du formulaire
   * @param {string} themeId  identifiant de thème (voir themes.js)
   * @param {object} [opts]   { export: true } pour le ZIP (images en fichiers, CSS/JS séparés)
   * @returns {{ html: string, css: string, js: string, images: Array, theme: object }}
   */
  function generatePortfolio(raw, themeId, opts) {
    opts = typeof opts === 'boolean' ? { export: opts } : (opts || {});
    const isExport = !!opts.export;
    const themes = (root.PORTFOLIO_THEMES || {});
    const theme = themes[themeId] || themes[Object.keys(themes)[0]];
    if (!theme) throw new Error('Aucun thème chargé (themes.js manquant).');

    const d = normalize(raw);
    const p = d.profile;
    const accent = d.design.accent || theme.accent;
    const accent2 = d.design.accent2 || theme.accent2 || accent;
    const images = [];

    let avatarSrc = p.avatar;
    if (avatarSrc && isExport) {
      const asset = imageAsset(avatarSrc, 'avatar');
      if (asset) { images.push(asset); avatarSrc = asset.path; }
    }

    // Sections présentes (dans l'ordre d'affichage)
    const plan = [];
    if (d.projects.length) plan.push(['projets', 'Projets']);
    if (d.experience.length) plan.push(['parcours', 'Parcours']);
    if (d.skills.length || d.softSkills.length || d.languages.length || d.hobbies.length) plan.push(['competences', 'Compétences']);
    if (d.education.length || d.certifications.length) plan.push(['formation', 'Formation']);
    plan.push(['contact', 'Contact']);
    const ids = plan.map(s => s[0]);
    const num = id => String(ids.indexOf(id) + 1).padStart(2, '0');

    const body = [buildHero(d, avatarSrc, ids)];
    if (ids.includes('projets')) body.push(buildProjects(d, images, isExport, num('projets')));
    if (ids.includes('parcours')) body.push(buildExperience(d, num('parcours')));
    if (ids.includes('competences')) body.push(buildSkills(d, num('competences')));
    if (ids.includes('formation')) body.push(buildEducation(d, num('formation')));
    body.push(buildContact(d, num('contact')));

    const navLinks = plan.filter(s => s[0] !== 'contact')
      .map(s => '<a href="#' + s[0] + '">' + esc(s[1]) + '</a>').join('') +
      '<a href="#contact" class="nav-cta">Me contacter</a>';

    const css =
      '/* Portfolio de ' + p.name.replace(/[^\p{L}\p{N} .'-]/gu, '') + ' — thème « ' + theme.name + ' » (généré par Portfolio Studio) */\n' +
      ':root {\n' +
      '  --font-display: ' + theme.fonts.display + ';\n' +
      '  --font-body: ' + theme.fonts.body + ';\n' +
      '  --font-mono: ' + (theme.fonts.mono || 'ui-monospace, SFMono-Regular, Menlo, monospace') + ';\n' +
      '  --heading-weight: ' + (theme.headingWeight || 700) + ';\n' +
      '  --heading-tracking: ' + (theme.headingTracking || '-0.02em') + ';\n' +
      '  --radius-sm: ' + theme.radius.sm + ';\n' +
      '  --radius-lg: ' + theme.radius.lg + ';\n' +
      '  --radius-btn: ' + theme.radius.btn + ';\n' +
      '  --wrap: ' + (theme.wrap || '1160px') + ';\n' +
      '  --header-h: 72px;\n' +
      '}\n' +
      'html[data-mode="light"] {\n' + paletteCss(theme.light, accent, accent2) + '\n}\n' +
      'html[data-mode="dark"] {\n' + paletteCss(theme.dark, accent, accent2) + '\n}\n' +
      BASE_CSS + '\n/* Spécificités du thème */\n' + (theme.css || '');

    const description = truncate(p.tagline || p.bio || (p.title + ' — portfolio de ' + p.name), 160);
    const pageTitle = p.name + (p.title ? ' — ' + p.title : '');
    const favicon = 'data:image/svg+xml,' + encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="' + ensureContrast(accent, theme.light.bg, 3) + '"/>' +
      '<text x="32" y="42" font-family="Arial,sans-serif" font-size="26" font-weight="700" text-anchor="middle" fill="' + inkOn(ensureContrast(accent, theme.light.bg, 3)) + '">' + esc(initials(p.name)) + '</text></svg>');

    const modeBootstrap =
      '<script>(function(){try{var m=localStorage.getItem("portfolio-mode");if(m==="light"||m==="dark")document.documentElement.setAttribute("data-mode",m);}catch(e){}})();</script>';

    // Dans l'aperçu de l'éditeur, la page est régénérée à chaque frappe : on coupe
    // les animations d'apparition pour éviter un clignotement permanent.
    const previewCss = opts.preview ? '\n.js .reveal { opacity: 1 !important; transform: none !important; transition: none !important; }' : '';
    const styleTag = isExport ? '<link rel="stylesheet" href="styles.css">' : '<style>' + css + previewCss + '</style>';
    const scriptTag = isExport ? '<script src="script.js" defer></script>' : '<script>' + BASE_JS + '</script>';

    const html = '<!DOCTYPE html>\n' +
      '<html lang="fr" data-mode="' + (theme.defaultMode === 'light' ? 'light' : 'dark') + '" data-theme="' + esc(theme.id) + '">\n' +
      '<head>\n' +
      '  <meta charset="UTF-8">\n' +
      '  <meta name="viewport" content="width=device-width, initial-scale=1">\n' +
      '  <title>' + esc(pageTitle) + '</title>\n' +
      '  <meta name="description" content="' + esc(description) + '">\n' +
      '  <meta name="author" content="' + esc(p.name) + '">\n' +
      '  <meta property="og:type" content="website">\n' +
      '  <meta property="og:title" content="' + esc(pageTitle) + '">\n' +
      '  <meta property="og:description" content="' + esc(description) + '">\n' +
      (isExport && avatarSrc ? '  <meta property="og:image" content="' + esc(avatarSrc) + '">\n' : '') +
      '  <meta property="og:locale" content="fr_FR">\n' +
      '  <meta name="theme-color" content="' + theme.dark.bg + '">\n' +
      '  <link rel="icon" href="' + esc(favicon) + '">\n' +
      '  ' + modeBootstrap + '\n' +
      '  <link rel="preconnect" href="https://fonts.googleapis.com">\n' +
      '  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n' +
      '  <link rel="stylesheet" href="' + esc(theme.fonts.url) + '">\n' +
      '  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css">\n' +
      '  ' + styleTag + '\n' +
      '</head>\n' +
      '<body>\n' +
      '<a class="skip-link" href="#contenu">Aller au contenu</a>\n' +
      '<header class="site-header"><div class="wrap header-inner">' +
        '<a href="#accueil" class="brand"><span class="brand-mark">' + esc(initials(p.name)) + '</span><span class="brand-name">' + esc(p.name) + '</span></a>' +
        '<nav class="site-nav" id="site-nav" aria-label="Navigation principale">' + navLinks + '</nav>' +
        '<div class="header-actions">' +
          '<button class="icon-btn" id="mode-toggle" type="button" aria-label="Basculer entre thème clair et sombre">' + icon('fas fa-moon icon-moon') + icon('fas fa-sun icon-sun') + '</button>' +
          '<button class="icon-btn menu-btn" id="menu-toggle" type="button" aria-label="Ouvrir le menu" aria-expanded="false" aria-controls="site-nav">' + icon('fas fa-bars') + '</button>' +
        '</div>' +
      '</div></header>\n' +
      '<main id="contenu">\n' + body.join('\n') + '\n</main>\n' +
      '<footer class="site-footer"><div class="wrap footer-inner"><p>© <span id="year">' + new Date().getFullYear() + '</span> ' + esc(p.name) +
        (p.location ? ' · ' + esc(p.location) : '') + '</p><a href="#accueil">Haut de page ' + icon('fas fa-arrow-up') + '</a></div></footer>\n' +
      scriptTag + '\n' +
      '</body>\n</html>\n';

    return { html, css, js: BASE_JS, images, theme };
  }

  const api = {
    esc, safeUrl, safeImage, isEmail, richText, splitList, initials, truncate, prettyUrl, phoneDigits,
    normalizeHex, contrast, ensureContrast, inkOn, mix,
    normalize, imageAsset, generatePortfolio
  };

  root.PortfolioEngine = api;
  root.generatePortfolio = generatePortfolio;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
