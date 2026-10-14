/**
 * Portfolio Studio — éditeur
 *
 * Tout l'état vit dans `state`. Le formulaire écrit dans `state`, l'aperçu et
 * les exports lisent `state`. Les valeurs saisies ne sont jamais injectées
 * dans le HTML de l'éditeur : elles passent par `.value`, ce qui évite qu'un
 * guillemet ou une balise ne casse le formulaire.
 */
(function () {
  'use strict';

  const E = window.PortfolioEngine;
  const THEMES = window.PORTFOLIO_THEMES;
  const CV_TEMPLATES = window.CV_TEMPLATES;

  const DRAFT_KEY = 'portfolio_studio_draft_v2';
  const LEGACY_DRAFT_KEY = 'portfolio_studio_draft';

  /* ==========================================================
     Données d'exemple
     ========================================================== */

  const DEMO = {
    theme: 'signature',
    cvTemplate: 'modern',
    data: {
      profile: {
        name: 'Awa Koffi',
        title: 'Développeuse web full-stack',
        tagline: 'Je conçois des applications web rapides, utiles et agréables à utiliser.',
        bio: "Basée à Cotonou, j'accompagne PME et startups de l'idée à la mise en ligne.\n- Sites vitrines et e-commerce\n- Applications métier sur mesure\n- Automatisation des tâches répétitives",
        email: 'awa.koffi@exemple.com',
        phone: '+229 01 23 45 67 89',
        location: 'Cotonou, Bénin',
        relocation: 'Ouverte au télétravail',
        availability: 'Immédiate',
        contract: 'Freelance / CDI',
        experience: '4',
        website: '',
        github: 'https://github.com/',
        linkedin: 'https://linkedin.com/',
        twitter: '',
        facebook: '',
        avatar: '',
        avatarAlt: ''
      },
      projects: [
        {
          title: 'Marché en ligne',
          category: 'E-commerce',
          date: '2025 · 4 mois',
          role: 'Solo · Full-stack',
          description: "Boutique en ligne pour une coopérative de producteurs locaux.\n- Catalogue et panier\n- Paiement mobile money\n- Tableau de bord des commandes",
          result: 'Plus de 300 commandes le premier mois',
          technologies: 'Next.js, Node.js, PostgreSQL',
          liveUrl: 'https://example.com',
          githubUrl: '',
          videoUrl: '',
          image: ''
        },
        {
          title: 'Gestion de stock',
          category: 'Application métier',
          date: '2024 · 2 mois',
          role: 'Équipe de 3 · Front-end',
          description: "Application interne de suivi des stocks pour un distributeur, utilisable sur tablette en entrepôt.",
          result: '',
          technologies: 'React, Firebase',
          liveUrl: '',
          githubUrl: 'https://github.com/',
          videoUrl: '',
          image: ''
        }
      ],
      experience: [
        {
          role: 'Développeuse full-stack',
          organization: 'Agence Digitale Atlantique',
          startDate: '2023',
          endDate: 'aujourd’hui',
          description: "- Développement de sites et d'applications pour une quinzaine de clients\n- Mise en place des déploiements automatiques",
          achievements: 'Temps de chargement des sites divisé par deux'
        },
        {
          role: 'Développeuse front-end (stage)',
          organization: 'StartUp Bénin',
          startDate: '2022',
          endDate: '2023',
          description: 'Intégration des maquettes et création de composants réutilisables.',
          achievements: ''
        }
      ],
      skills: [
        { name: 'JavaScript / TypeScript', group: 'Développement web' },
        { name: 'React / Next.js', group: 'Développement web' },
        { name: 'Node.js', group: 'Développement web' },
        { name: 'PostgreSQL', group: 'Développement web' },
        { name: 'Figma', group: 'Design' },
        { name: 'n8n', group: 'Automatisation' }
      ],
      softSkills: [{ name: 'Autonomie' }, { name: 'Esprit d’équipe' }],
      education: [{ degree: 'Licence en informatique', institution: 'Université d’Abomey-Calavi', startDate: '2019', endDate: '2022' }],
      certificationsList: [{ name: 'Marketing numérique', authority: 'OIF', date: '2025' }],
      languagesList: [{ name: 'Français', level: 'Langue maternelle' }, { name: 'Anglais', level: 'Courant (B2)' }],
      hobbiesList: [{ name: 'Photographie' }],
      references: [],
      design: { accentColor: '', secondaryColor: '', cvAccent: '' }
    }
  };

  /* ==========================================================
     Schéma des listes répétables
     ========================================================== */

  const REPEATERS = {
    projects: {
      label: 'Projet', icon: 'fa-folder-open', titleKey: 'title',
      fields: [
        { key: 'image', type: 'image', label: 'Capture d’écran', full: true },
        { key: 'title', label: 'Nom du projet', placeholder: 'Marché en ligne' },
        { key: 'category', label: 'Catégorie', placeholder: 'E-commerce' },
        { key: 'date', label: 'Date / durée', placeholder: '2025 · 3 mois' },
        { key: 'role', label: 'Votre rôle', placeholder: 'Solo · Full-stack' },
        { key: 'description', type: 'textarea', label: 'Description', placeholder: "Ce que fait le projet et ce que vous avez réalisé.\n- Une fonctionnalité clé\n- Une autre", full: true },
        { key: 'result', label: 'Résultat clé (optionnel)', placeholder: 'Ventes en hausse de 60 %', full: true },
        { key: 'technologies', label: 'Technologies (séparées par des virgules)', placeholder: 'React, Node.js, PostgreSQL', full: true },
        { key: 'liveUrl', type: 'url', label: 'Lien du site', placeholder: 'https://…' },
        { key: 'githubUrl', type: 'url', label: 'Lien du code', placeholder: 'https://github.com/…' },
        { key: 'videoUrl', type: 'url', label: 'Vidéo de démo (optionnel)', placeholder: 'https://youtube.com/…', full: true }
      ]
    },
    experience: {
      label: 'Expérience', icon: 'fa-briefcase', titleKey: 'role',
      fields: [
        { key: 'role', label: 'Poste', placeholder: 'Développeur web' },
        { key: 'organization', label: 'Entreprise', placeholder: 'Nom de l’entreprise' },
        { key: 'startDate', label: 'Début', placeholder: '09/2023' },
        { key: 'endDate', label: 'Fin', placeholder: 'aujourd’hui' },
        { key: 'description', type: 'textarea', label: 'Missions', placeholder: "- Une mission\n- Une autre mission", full: true },
        { key: 'achievements', label: 'Résultat chiffré (optionnel)', placeholder: '+30 % de conversions', full: true }
      ]
    },
    skills: {
      label: 'Compétence', icon: 'fa-code', titleKey: 'name', compact: true,
      fields: [
        { key: 'name', label: 'Compétence', placeholder: 'React' },
        { key: 'group', type: 'group', label: 'Domaine', placeholder: 'Développement web' }
      ]
    },
    softSkills: {
      label: 'Savoir-être', icon: 'fa-people-group', titleKey: 'name', compact: true,
      fields: [{ key: 'name', label: 'Savoir-être', placeholder: 'Autonomie', full: true }]
    },
    education: {
      label: 'Formation', icon: 'fa-graduation-cap', titleKey: 'degree',
      fields: [
        { key: 'degree', label: 'Diplôme', placeholder: 'Licence en informatique' },
        { key: 'institution', label: 'Établissement', placeholder: 'Université…' },
        { key: 'startDate', label: 'Début', placeholder: '2019' },
        { key: 'endDate', label: 'Fin', placeholder: '2022' }
      ]
    },
    certificationsList: {
      label: 'Certification', icon: 'fa-award', titleKey: 'name',
      fields: [
        { key: 'name', label: 'Certification', placeholder: 'AWS Cloud Practitioner' },
        { key: 'authority', label: 'Organisme', placeholder: 'Amazon Web Services' },
        { key: 'date', label: 'Année', placeholder: '2025', full: true }
      ]
    },
    languagesList: {
      label: 'Langue', icon: 'fa-language', titleKey: 'name', compact: true,
      fields: [
        { key: 'name', label: 'Langue', placeholder: 'Anglais' },
        { key: 'level', label: 'Niveau', placeholder: 'Courant (B2)' }
      ]
    },
    hobbiesList: {
      label: 'Centre d’intérêt', icon: 'fa-heart', titleKey: 'name', compact: true,
      fields: [{ key: 'name', label: 'Centre d’intérêt', placeholder: 'Photographie', full: true }]
    },
    references: {
      label: 'Référence', icon: 'fa-id-badge', titleKey: 'name',
      fields: [
        { key: 'name', label: 'Nom', placeholder: 'Jean Dupont' },
        { key: 'role', label: 'Poste et entreprise', placeholder: 'CTO, Entreprise' },
        { key: 'contact', label: 'Contact', placeholder: 'email ou téléphone', full: true }
      ]
    }
  };

  const PRESETS = [
    ['Terracotta', '#e8743b', '#f2b84b'],
    ['Océan', '#2563eb', '#60a5fa'],
    ['Émeraude', '#059669', '#34d399'],
    ['Indigo', '#4f46e5', '#a78bfa'],
    ['Rubis', '#be123c', '#fb7185'],
    ['Lagune', '#0891b2', '#22d3ee'],
    ['Or', '#ca8a04', '#facc15'],
    ['Graphite', '#334155', '#94a3b8']
  ];

  const LEGACY_THEMES = { minimalist: 'minimal', corporate: 'minimal', creative: 'signature', brutalist: 'signature', developer: 'terminal', editorial: 'editorial' };

  /* ==========================================================
     État
     ========================================================== */

  let state = null;
  let previewMode = 'portfolio';
  let device = 'desktop';
  let saveWarned = false;

  const clone = o => JSON.parse(JSON.stringify(o));
  const $ = (sel, el) => (el || document).querySelector(sel);
  const $$ = (sel, el) => Array.prototype.slice.call((el || document).querySelectorAll(sel));

  function getPath(obj, path) {
    return path.split('.').reduce((o, k) => (o ? o[k] : undefined), obj);
  }
  function setPath(obj, path, value) {
    const keys = path.split('.');
    let o = obj;
    keys.slice(0, -1).forEach(k => { if (!o[k] || typeof o[k] !== 'object') o[k] = {}; o = o[k]; });
    o[keys[keys.length - 1]] = value;
  }

  /** Remet n'importe quel brouillon (ancienne ou nouvelle version) au format attendu. */
  function migrate(saved) {
    const s = { theme: 'signature', cvTemplate: 'modern', data: clone(DEMO.data) };
    if (!saved || typeof saved !== 'object') return s;

    const isV2 = saved.data && typeof saved.data === 'object';
    const d = isV2 ? saved.data : saved;
    const base = { profile: {}, design: {} };
    Object.keys(REPEATERS).forEach(k => { base[k] = []; });
    const out = Object.assign(base, d);

    out.profile = Object.assign({}, d.profile || {});
    out.design = Object.assign({ accentColor: '', secondaryColor: '', cvAccent: '' }, d.design || {});
    out.experience = (d.experience && d.experience.length ? d.experience : d.timeline) || [];
    out.skills = (d.skills || []).map(x => ({ name: x.name || '', group: x.group || '' }));
    out.certificationsList = d.certificationsList || d.certifications || [];
    delete out.timeline;
    delete out.certifications;
    Object.keys(REPEATERS).forEach(k => { if (!Array.isArray(out[k])) out[k] = []; });

    s.data = out;
    const theme = isV2 ? saved.theme : (saved.currentTheme || '');
    s.theme = THEMES[theme] ? theme : (LEGACY_THEMES[theme] || 'signature');
    const cv = isV2 ? saved.cvTemplate : (d.design && d.design.cvTemplate) || saved.currentCVTemplate;
    s.cvTemplate = CV_TEMPLATES[cv] ? cv : 'modern';
    return s;
  }

  function loadState() {
    try {
      const v2 = localStorage.getItem(DRAFT_KEY);
      if (v2) return migrate(JSON.parse(v2));
      const v1 = localStorage.getItem(LEGACY_DRAFT_KEY);
      if (v1) return migrate(JSON.parse(v1));
    } catch (e) {
      console.warn('Brouillon illisible, retour aux données d’exemple.', e);
    }
    return clone(DEMO);
  }

  function saveState() {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(state));
      setSaveStatus('saved');
    } catch (e) {
      setSaveStatus('error');
      if (!saveWarned) {
        saveWarned = true;
        toast('Le brouillon est trop lourd pour être enregistré dans le navigateur (images ?). Pensez à exporter vos données.', 'error');
      }
    }
  }

  function setSaveStatus(kind) {
    const el = $('#save-status');
    if (!el) return;
    el.dataset.state = kind;
    el.innerHTML = kind === 'saving'
      ? '<i class="fas fa-circle-notch fa-spin" aria-hidden="true"></i> Enregistrement…'
      : kind === 'error'
        ? '<i class="fas fa-triangle-exclamation" aria-hidden="true"></i> Non enregistré'
        : '<i class="fas fa-circle-check" aria-hidden="true"></i> Brouillon enregistré';
  }

  /* ==========================================================
     Données envoyées au moteur
     ========================================================== */

  function payload() {
    const d = clone(state.data);
    const theme = THEMES[state.theme];
    d.design.accentColor = d.design.accentColor || theme.accent;
    d.design.secondaryColor = d.design.secondaryColor || theme.accent2;
    d.design.cvAccent = d.design.cvAccent || CV_TEMPLATES[state.cvTemplate].accent;
    d.design.cvTemplate = state.cvTemplate;
    return d;
  }

  /* ==========================================================
     Mise à jour (aperçu + sauvegarde) avec anti-rebond
     ========================================================== */

  let timer = null;
  function changed() {
    setSaveStatus('saving');
    clearTimeout(timer);
    timer = setTimeout(() => { renderPreview(); saveState(); }, 300);
  }

  function renderPreview() {
    const frame = $('#preview-frame');
    if (!frame) return;
    let html;
    try {
      html = previewMode === 'cv'
        ? window.generateCV(payload())
        : E.generatePortfolio(payload(), state.theme, { preview: true }).html;
    } catch (e) {
      console.error(e);
      html = '<p style="font-family:sans-serif;padding:2rem">Erreur de génération : ' + E.esc(e.message) + '</p>';
    }
    const win = frame.contentWindow;
    const y = win ? win.scrollY : 0;
    const doc = frame.contentDocument || (win && win.document);
    if (doc) {
      doc.open();
      doc.write(html);
      doc.close();
      if (y) setTimeout(() => { try { frame.contentWindow.scrollTo(0, y); } catch (e) {} }, 30);
    } else {
      frame.srcdoc = html;
    }
  }

  /* ==========================================================
     Champs simples (data-bind)
     ========================================================== */

  function bindFields() {
    $$('[data-bind]').forEach(el => {
      const path = el.dataset.bind;
      const value = getPath(state.data, path);
      if (el.type === 'color') {
        el.value = value || defaultColorFor(path);
      } else {
        el.value = value || '';
      }
      validateField(el);
    });
    updateColorLabels();
  }

  function defaultColorFor(path) {
    const theme = THEMES[state.theme];
    if (path === 'design.accentColor') return theme.accent;
    if (path === 'design.secondaryColor') return theme.accent2;
    if (path === 'design.cvAccent') return CV_TEMPLATES[state.cvTemplate].accent;
    return '#000000';
  }

  function updateColorLabels() {
    const set = (id, path) => { const el = $(id); if (el) el.textContent = (getPath(state.data, path) || defaultColorFor(path)).toUpperCase(); };
    set('#accent-hex', 'design.accentColor');
    set('#secondary-hex', 'design.secondaryColor');
    set('#cv-accent-hex', 'design.cvAccent');
  }

  function validateField(el) {
    let ok = true;
    const v = el.value.trim();
    if (v && (el.hasAttribute('data-url') || el.type === 'url')) ok = !!E.safeUrl(v);
    if (v && el.type === 'email') ok = E.isEmail(v);
    el.classList.toggle('invalid', !ok);
    el.setAttribute('aria-invalid', String(!ok));
    return ok;
  }

  function onFieldInput(e) {
    const el = e.target;
    if (!el.matches('[data-bind]')) return;
    setPath(state.data, el.dataset.bind, el.value);
    validateField(el);
    if (el.type === 'color') updateColorLabels();
    changed();
  }

  /* ==========================================================
     Listes répétables
     ========================================================== */

  function el(tag, attrs, children) {
    const node = document.createElement(tag);
    Object.entries(attrs || {}).forEach(([k, v]) => {
      if (v === undefined || v === null || v === false) return;
      if (k === 'class') node.className = v;
      else if (k === 'text') node.textContent = v;
      else if (k === 'html') node.innerHTML = v; // uniquement du HTML statique (icônes)
      else node.setAttribute(k, v === true ? '' : v);
    });
    (children || []).forEach(c => c && node.appendChild(c));
    return node;
  }

  function cardTitle(name, item, index) {
    const def = REPEATERS[name];
    const t = (item[def.titleKey] || '').trim();
    return t || def.label + ' ' + (index + 1);
  }

  function renderRepeater(name) {
    const def = REPEATERS[name];
    const container = $('[data-repeater="' + name + '"]');
    if (!container) return;
    const items = state.data[name];
    container.innerHTML = '';

    if (!items.length) {
      container.appendChild(el('p', { class: 'empty', text: 'Rien pour le moment.' }));
    }

    items.forEach((item, index) => {
      const header = el('div', { class: 'repeater-card-header' }, [
        el('span', { class: 'repeater-card-title' }, [
          el('i', { class: 'fas ' + def.icon, 'aria-hidden': 'true' }),
          el('span', { class: 'card-title-text', text: cardTitle(name, item, index) })
        ]),
        el('div', { class: 'card-actions' }, [
          el('button', { type: 'button', class: 'icon-btn-sm', title: 'Monter', 'aria-label': 'Monter', 'data-move': '-1', disabled: index === 0, html: '<i class="fas fa-arrow-up" aria-hidden="true"></i>' }),
          el('button', { type: 'button', class: 'icon-btn-sm', title: 'Descendre', 'aria-label': 'Descendre', 'data-move': '1', disabled: index === items.length - 1, html: '<i class="fas fa-arrow-down" aria-hidden="true"></i>' }),
          el('button', { type: 'button', class: 'icon-btn-sm danger', title: 'Supprimer', 'aria-label': 'Supprimer', 'data-remove': '', html: '<i class="fas fa-trash" aria-hidden="true"></i>' })
        ])
      ]);

      const grid = el('div', { class: 'form-grid' });
      def.fields.forEach(f => grid.appendChild(renderField(name, item, index, f)));

      const card = el('div', { class: 'repeater-card' + (def.compact ? ' compact' : ''), 'data-index': index }, [header, grid]);
      container.appendChild(card);
    });
  }

  function renderField(name, item, index, f) {
    const id = name + '-' + index + '-' + f.key;
    const group = el('div', { class: 'form-group' + (f.full ? ' form-group-full' : '') });

    if (f.type === 'image') {
      const thumb = el('div', { class: 'preview-thumb wide' });
      setThumb(thumb, item.image, 'fa-image');
      const input = el('input', { type: 'file', id: id, class: 'file-input', accept: 'image/png,image/jpeg,image/webp', 'data-image': f.key });
      const removeBtn = el('button', { type: 'button', class: 'link-btn', 'data-image-remove': f.key, text: 'Retirer', hidden: !item.image });
      group.appendChild(el('span', { class: 'label', text: f.label }));
      group.appendChild(el('div', { class: 'upload-wrapper' }, [
        thumb,
        el('div', { class: 'upload-actions' }, [
          el('div', { class: 'upload-buttons' }, [el('label', { for: id, class: 'upload-btn-label', text: 'Importer une image' }), removeBtn]),
          input,
          el('span', { class: 'upload-hint', text: 'Une capture de la page d’accueil, au format paysage.' })
        ])
      ]));
      return group;
    }

    group.appendChild(el('label', { for: id, text: f.label }));
    let input;
    if (f.type === 'textarea') {
      input = el('textarea', { id: id, class: 'form-control', rows: '4', placeholder: f.placeholder });
    } else {
      input = el('input', {
        id: id, class: 'form-control',
        type: f.type === 'url' ? 'url' : 'text',
        placeholder: f.placeholder,
        list: f.type === 'group' ? 'skill-groups' : null,
        'data-url': f.type === 'url' ? '' : null
      });
    }
    input.value = item[f.key] || '';
    input.dataset.field = f.key;
    validateField(input);
    group.appendChild(input);
    return group;
  }

  function setThumb(thumb, src, iconName) {
    if (src) {
      thumb.style.backgroundImage = 'url("' + src.replace(/"/g, '%22') + '")';
      thumb.innerHTML = '';
    } else {
      thumb.style.backgroundImage = '';
      thumb.innerHTML = '<i class="fas ' + iconName + '" aria-hidden="true"></i>';
    }
  }

  function updateGroupSuggestions() {
    const list = $('#skill-groups');
    if (!list) return;
    const groups = Array.from(new Set(['Développement web', 'Design', 'IA & automatisation', 'Marketing digital', 'Outils']
      .concat(state.data.skills.map(s => (s.group || '').trim()).filter(Boolean))));
    list.innerHTML = '';
    groups.forEach(g => { const o = document.createElement('option'); o.value = g; list.appendChild(o); });
  }

  function onRepeaterEvent(e) {
    const container = e.target.closest('[data-repeater]');
    if (!container) return;
    const name = container.dataset.repeater;
    const card = e.target.closest('.repeater-card');
    if (!card) return;
    const index = Number(card.dataset.index);
    const item = state.data[name][index];

    if (e.type === 'input' && e.target.dataset.field) {
      item[e.target.dataset.field] = e.target.value;
      validateField(e.target);
      if (e.target.dataset.field === REPEATERS[name].titleKey) {
        $('.card-title-text', card).textContent = cardTitle(name, item, index);
      }
      if (name === 'skills' && e.target.dataset.field === 'group') updateGroupSuggestions();
      changed();
      return;
    }

    if (e.type === 'change' && e.target.dataset.image) {
      const file = e.target.files && e.target.files[0];
      e.target.value = '';
      if (!file) return;
      readImage(file, 1200, dataUrl => {
        item.image = dataUrl;
        setThumb($('.preview-thumb', card), dataUrl, 'fa-image');
        $('[data-image-remove]', card).hidden = false;
        changed();
      });
      return;
    }

    if (e.type !== 'click') return;
    const btn = e.target.closest('button');
    if (!btn) return;
    if (btn.hasAttribute('data-remove')) {
      const label = cardTitle(name, item, index);
      if (!confirm('Supprimer « ' + label + ' » ?')) return;
      state.data[name].splice(index, 1);
      renderRepeater(name);
      changed();
    } else if (btn.dataset.move) {
      const to = index + Number(btn.dataset.move);
      if (to < 0 || to >= state.data[name].length) return;
      const list = state.data[name];
      [list[index], list[to]] = [list[to], list[index]];
      renderRepeater(name);
      const moved = $('[data-repeater="' + name + '"] .repeater-card[data-index="' + to + '"]');
      if (moved) moved.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      changed();
    } else if (btn.hasAttribute('data-image-remove')) {
      item.image = '';
      setThumb($('.preview-thumb', card), '', 'fa-image');
      btn.hidden = true;
      changed();
    }
  }

  function addItem(name) {
    const item = {};
    REPEATERS[name].fields.forEach(f => { item[f.key] = ''; });
    state.data[name].push(item);
    renderRepeater(name);
    const cards = $$('[data-repeater="' + name + '"] .repeater-card');
    const last = cards[cards.length - 1];
    if (last) {
      last.scrollIntoView({ block: 'center', behavior: 'smooth' });
      const first = $('input.form-control, textarea', last);
      if (first) first.focus({ preventScroll: true });
    }
    changed();
  }

  /* ==========================================================
     Images : redimensionnement et compression côté navigateur
     ========================================================== */

  function readImage(file, maxSize, done) {
    if (!/^image\/(png|jpe?g|webp)$/.test(file.type)) {
      toast('Format non pris en charge. Utilisez JPG, PNG ou WEBP.', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => toast('Impossible de lire ce fichier.', 'error');
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => toast('Cette image semble corrompue.', 'error');
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        done(canvas.toDataURL('image/jpeg', 0.82));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  }

  function renderAvatar() {
    setThumb($('#avatar-preview'), state.data.profile.avatar, 'fa-user');
    $('#avatar-remove').hidden = !state.data.profile.avatar;
  }

  /* ==========================================================
     Thèmes, couleurs, modèles de CV
     ========================================================== */

  function renderThemeCards() {
    const grid = $('#theme-grid');
    grid.innerHTML = '';
    Object.values(THEMES).forEach(t => {
      const card = el('button', {
        type: 'button', class: 'theme-card' + (state.theme === t.id ? ' selected' : ''),
        role: 'radio', 'aria-checked': String(state.theme === t.id), 'data-theme': t.id
      }, [
        el('span', { class: 'theme-swatch', 'aria-hidden': 'true' }, [
          el('span', { class: 'sw-bg' }), el('span', { class: 'sw-line l1' }), el('span', { class: 'sw-line l2' }), el('span', { class: 'sw-dot' })
        ]),
        el('span', { class: 'theme-card-name', text: t.name }),
        el('span', { class: 'theme-card-desc', text: t.description }),
        el('span', { class: 'theme-badge', html: '<i class="fas fa-check" aria-hidden="true"></i>' })
      ]);
      const sw = $('.theme-swatch', card);
      sw.style.setProperty('--sw-bg', t.swatch[0]);
      sw.style.setProperty('--sw-accent', t.swatch[1]);
      sw.style.setProperty('--sw-text', t.defaultMode === 'dark' ? t.dark.text : t.light.text);
      sw.style.setProperty('--sw-font', t.fonts.display);
      grid.appendChild(card);
    });
  }

  function renderCvCards() {
    const grid = $('#cv-grid');
    grid.innerHTML = '';
    Object.values(CV_TEMPLATES).forEach(t => {
      const card = el('button', {
        type: 'button', class: 'theme-card cv-card' + (state.cvTemplate === t.id ? ' selected' : ''),
        role: 'radio', 'aria-checked': String(state.cvTemplate === t.id), 'data-cv': t.id
      }, [
        el('span', { class: 'cv-swatch cv-sw-' + t.id, 'aria-hidden': 'true' }, [el('span'), el('span'), el('span')]),
        el('span', { class: 'theme-card-name', text: t.name }),
        el('span', { class: 'theme-card-desc', text: t.description }),
        el('span', { class: 'theme-badge', html: '<i class="fas fa-check" aria-hidden="true"></i>' })
      ]);
      $('.cv-swatch', card).style.setProperty('--sw-accent', t.accent);
      grid.appendChild(card);
    });
  }

  function renderPresets() {
    const grid = $('#preset-grid');
    grid.innerHTML = '';
    PRESETS.forEach(([name, a, b]) => {
      const btn = el('button', { type: 'button', class: 'preset-color-card', 'data-preset': a + ',' + b, title: name }, [
        el('span', { class: 'preset-colors', 'aria-hidden': 'true' }, [el('span'), el('span')]),
        el('span', { class: 'preset-name', text: name })
      ]);
      const spans = $$('.preset-colors span', btn);
      spans[0].style.background = a;
      spans[1].style.background = b;
      grid.appendChild(btn);
    });
  }

  function selectTheme(id) {
    if (!THEMES[id] || id === state.theme) return;
    const prev = THEMES[state.theme];
    const design = state.data.design;
    // Si l'utilisateur n'a pas personnalisé la couleur, on prend celle du nouveau thème.
    if (!design.accentColor || design.accentColor.toLowerCase() === prev.accent) design.accentColor = '';
    if (!design.secondaryColor || design.secondaryColor.toLowerCase() === prev.accent2) design.secondaryColor = '';
    state.theme = id;
    renderThemeCards();
    bindFields();
    setPreviewMode('portfolio');
    changed();
  }

  function selectCv(id) {
    if (!CV_TEMPLATES[id]) return;
    const prev = CV_TEMPLATES[state.cvTemplate];
    if (!state.data.design.cvAccent || state.data.design.cvAccent.toLowerCase() === prev.accent) state.data.design.cvAccent = '';
    state.cvTemplate = id;
    renderCvCards();
    bindFields();
    setPreviewMode('cv');
    changed();
  }

  /* ==========================================================
     Navigation, aperçu, affichage mobile
     ========================================================== */

  function switchTab(tab) {
    $$('.editor-section').forEach(s => s.classList.toggle('active', s.id === 'sec-' + tab));
    $$('.nav-item').forEach(b => {
      const on = b.dataset.tab === tab;
      b.classList.toggle('active', on);
      if (on) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
    });
    $('#editor').scrollTop = 0;
    if (tab === 'cv') setPreviewMode('cv');
    else if (previewMode === 'cv' && tab !== 'export') setPreviewMode('portfolio');
  }

  function setPreviewMode(mode) {
    if (previewMode === mode) return;
    previewMode = mode;
    $$('[data-preview]').forEach(b => b.classList.toggle('active', b.dataset.preview === mode));
    $('#preview-frame').setAttribute('title', mode === 'cv' ? 'Aperçu du CV' : 'Aperçu du portfolio');
    fitPreview();
    renderPreview();
  }

  function setDevice(d) {
    device = d;
    $$('[data-device]').forEach(b => b.classList.toggle('active', b.dataset.device === d));
    $('#preview-wrapper').dataset.device = d;
    fitPreview();
  }

  /**
   * En mode « ordinateur », la page est rendue à 1280 px de large puis réduite
   * pour tenir dans le panneau : on voit la vraie mise en page desktop.
   * Le CV est rendu à sa largeur A4 (≈ 800 px) de la même façon.
   */
  function fitPreview() {
    const wrapper = $('#preview-wrapper');
    const frame = $('#preview-frame');
    if (!wrapper || !frame) return;
    wrapper.dataset.device = previewMode === 'cv' ? 'desktop' : device; // un CV A4 n'a pas de version mobile
    if (device === 'mobile' && previewMode !== 'cv') {
      frame.style.cssText = '';
      return;
    }
    const styles = getComputedStyle(wrapper);
    const availW = wrapper.clientWidth - parseFloat(styles.paddingLeft) - parseFloat(styles.paddingRight);
    const availH = wrapper.clientHeight - parseFloat(styles.paddingTop) - parseFloat(styles.paddingBottom);
    const target = previewMode === 'cv' ? 820 : 1280;
    const scale = Math.min(1, availW / target);
    frame.style.width = target + 'px';
    frame.style.height = (availH / scale) + 'px';
    frame.style.transform = 'scale(' + scale + ')';
    frame.style.transformOrigin = 'top left';
    frame.style.flex = 'none';
    // Un élément mis à l'échelle garde sa taille d'origine dans la mise en page :
    // des marges négatives lui rendent sa taille visible.
    frame.style.marginRight = -(target * (1 - scale)) + 'px';
    frame.style.marginBottom = -((availH / scale) * (1 - scale)) + 'px';
  }

  function setView(view) {
    $('.studio').dataset.view = view;
    $$('[data-view-btn]').forEach(b => b.classList.toggle('active', b.dataset.viewBtn === view));
    if (view === 'preview') { fitPreview(); renderPreview(); }
  }

  /* ==========================================================
     Vérifications avant export
     ========================================================== */

  function validateAll() {
    if (!state.data.profile.name || !state.data.profile.name.trim()) {
      switchTab('about');
      setView('edit');
      const f = $('#profile-name');
      f.classList.add('invalid');
      f.focus();
      toast('Indiquez au moins votre nom.', 'error');
      return false;
    }
    const bad = $$('.form-control.invalid');
    if (bad.length) {
      const section = bad[0].closest('.editor-section');
      if (section) switchTab(section.id.replace('sec-', ''));
      setView('edit');
      bad[0].focus();
      toast(bad.length > 1 ? bad.length + ' champs sont invalides (liens ou email). Ils seront ignorés si vous ne les corrigez pas.'
        : 'Un lien ou un email est invalide. Il sera ignoré si vous ne le corrigez pas.', 'error');
      return confirm('Certains liens ou emails sont invalides et seront ignorés. Continuer quand même ?');
    }
    return true;
  }

  function slug(s) {
    return String(s || 'portfolio').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'portfolio';
  }

  function download(blob, filename) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }

  function openInNewWindow(html) {
    const w = window.open('', '_blank');
    if (!w) { toast('Autorisez les fenêtres pop-up pour ouvrir l’aperçu.', 'error'); return null; }
    w.document.open();
    w.document.write(html);
    w.document.close();
    return w;
  }

  function exportZip() {
    if (!validateAll()) return;
    if (typeof JSZip === 'undefined') { toast('La bibliothèque ZIP n’a pas pu être chargée (connexion ?).', 'error'); return; }
    const out = E.generatePortfolio(payload(), state.theme, { export: true });
    const zip = new JSZip();
    zip.file('index.html', out.html);
    zip.file('styles.css', out.css);
    zip.file('script.js', out.js);
    const images = zip.folder('images');
    out.images.forEach(img => images.file(img.filename, img.base64, { base64: true }));
    toast('Préparation du fichier ZIP…');
    zip.generateAsync({ type: 'blob' })
      .then(blob => { download(blob, 'portfolio-' + slug(state.data.profile.name) + '.zip'); toast('ZIP téléchargé. Il est prêt à être mis en ligne.'); })
      .catch(err => { console.error(err); toast('Erreur lors de la création du ZIP.', 'error'); });
  }

  function openFullscreen() {
    if (!validateAll()) return;
    openInNewWindow(E.generatePortfolio(payload(), state.theme).html);
  }

  function previewCv() {
    openInNewWindow(window.generateCV(payload()));
  }

  function downloadCv() {
    if (!validateAll()) return;
    const html = window.generateCV(payload());
    const filename = 'CV-' + slug(state.data.profile.name) + '.pdf';

    if (typeof html2pdf === 'undefined') {
      // Sans la bibliothèque PDF : on ouvre la fenêtre d'impression (Enregistrer en PDF).
      const w = openInNewWindow(html);
      if (w) setTimeout(() => w.print(), 400);
      return;
    }

    // Le CV est inséré hors écran dans la page : ses styles sont limités au bloc
    // .cv-page (voir cv.js), ils n'affectent donc pas l'éditeur.
    const frag = window.generateCV(payload(), { fragment: true });
    const holder = document.createElement('div');
    holder.setAttribute('aria-hidden', 'true');
    holder.style.cssText = 'position:fixed;left:-10000px;top:0;width:210mm;background:#fff;pointer-events:none;';
    holder.innerHTML = '<style>' + frag.css + '</style>' + frag.html;
    document.body.appendChild(holder);
    const page = holder.querySelector('.cv-page');
    page.style.margin = '0';
    toast('Génération du PDF…');

    const imgs = Array.prototype.slice.call(page.querySelectorAll('img'));
    Promise.all(imgs.map(img => img.complete ? null : new Promise(r => { img.onload = img.onerror = r; })))
      .then(() => (document.fonts && document.fonts.ready) || null)
      .then(() => html2pdf().set({
        margin: [8, 0, 8, 0], // marges haut/bas en mm, pour que les pages suivantes ne collent pas au bord
        filename,
        image: { type: 'jpeg', quality: 0.96 },
        html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff', scrollX: 0, scrollY: 0 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['css', 'legacy'], avoid: ['.cv-item', '.cv-skill-group'] }
      }).from(page).save())
      .then(() => toast('CV téléchargé.'))
      .catch(err => { console.error(err); toast('Erreur lors de la génération du PDF.', 'error'); })
      .finally(() => holder.remove());
  }

  function exportJson() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    download(blob, 'portfolio-studio-' + slug(state.data.profile.name) + '.json');
  }

  function importJson(file) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        state = migrate(JSON.parse(reader.result));
        renderAll();
        saveState();
        toast('Données importées.');
      } catch (e) {
        toast('Ce fichier n’est pas une sauvegarde valide.', 'error');
      }
    };
    reader.readAsText(file);
  }

  function resetDemo() {
    if (!confirm('Remplacer toutes vos informations par les données d’exemple ? Pensez à exporter vos données avant si vous voulez les garder.')) return;
    state = clone(DEMO);
    renderAll();
    saveState();
    toast('Données d’exemple rechargées.');
  }

  /* ==========================================================
     Notifications
     ========================================================== */

  let toastTimer = null;
  function toast(message, type) {
    const t = $('#studio-toast');
    if (!t) return;
    $('#toast-message').textContent = message;
    t.className = 'toast show ' + (type === 'error' ? 'error' : 'success');
    $('i', t).className = type === 'error' ? 'fas fa-circle-exclamation' : 'fas fa-circle-check';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), type === 'error' ? 6000 : 3500);
  }

  /* ==========================================================
     Démarrage
     ========================================================== */

  function renderAll() {
    bindFields();
    renderAvatar();
    Object.keys(REPEATERS).forEach(renderRepeater);
    updateGroupSuggestions();
    renderThemeCards();
    renderCvCards();
    renderPreview();
  }

  function init() {
    state = loadState();
    renderPresets();
    renderAll();

    const editor = $('#editor');
    editor.addEventListener('input', onFieldInput);
    editor.addEventListener('input', onRepeaterEvent);
    editor.addEventListener('change', onRepeaterEvent);
    editor.addEventListener('click', onRepeaterEvent);

    $$('[data-add]').forEach(b => b.addEventListener('click', () => addItem(b.dataset.add)));
    $$('.nav-item').forEach(b => b.addEventListener('click', () => { switchTab(b.dataset.tab); setView('edit'); }));
    $$('[data-preview]').forEach(b => b.addEventListener('click', () => setPreviewMode(b.dataset.preview)));
    $$('[data-device]').forEach(b => b.addEventListener('click', () => setDevice(b.dataset.device)));
    $$('[data-view-btn]').forEach(b => b.addEventListener('click', () => setView(b.dataset.viewBtn)));

    $('#theme-grid').addEventListener('click', e => { const c = e.target.closest('[data-theme]'); if (c) selectTheme(c.dataset.theme); });
    $('#cv-grid').addEventListener('click', e => { const c = e.target.closest('[data-cv]'); if (c) selectCv(c.dataset.cv); });
    $('#preset-grid').addEventListener('click', e => {
      const c = e.target.closest('[data-preset]');
      if (!c) return;
      const [a, b] = c.dataset.preset.split(',');
      state.data.design.accentColor = a;
      state.data.design.secondaryColor = b;
      bindFields();
      changed();
    });

    $('#avatar-upload').addEventListener('change', e => {
      const file = e.target.files && e.target.files[0];
      e.target.value = '';
      if (!file) return;
      readImage(file, 800, url => { state.data.profile.avatar = url; renderAvatar(); changed(); });
    });
    $('#avatar-remove').addEventListener('click', () => { state.data.profile.avatar = ''; renderAvatar(); changed(); });

    $('#zip-btn').addEventListener('click', exportZip);
    $('#fullscreen-btn').addEventListener('click', openFullscreen);
    $('#cv-preview-btn').addEventListener('click', previewCv);
    $('#cv-download-btn').addEventListener('click', downloadCv);
    $('#json-export-btn').addEventListener('click', exportJson);
    $('#json-import').addEventListener('change', e => { const f = e.target.files && e.target.files[0]; e.target.value = ''; if (f) importJson(f); });
    $('#reset-btn').addEventListener('click', resetDemo);

    setDevice(window.matchMedia('(max-width: 960px)').matches ? 'mobile' : 'desktop');
    if ('ResizeObserver' in window) new ResizeObserver(fitPreview).observe($('#preview-wrapper'));
    else window.addEventListener('resize', fitPreview);
    setSaveStatus('saved');
  }

  // Exposé pour les tests et le débogage
  window.PortfolioStudio = { get state() { return state; }, migrate, payload: () => payload(), exportZip, switchTab, selectTheme, selectCv };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
